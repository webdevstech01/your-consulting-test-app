import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import axios from 'axios';

interface CarOption {
  id: number;
  brand: string;
  model: string;
  label: string;
}
@Component({
  selector: 'app-person-modal',
  templateUrl: './person-modal.component.html',
  styleUrls: ['./person-modal.component.scss'],
})
export class PersonModalComponent implements OnInit {
  person = {
    lastName: '',
    firstName: '',
    cnp: '',
    age: null as number | null,
  };

  availableCars: CarOption[] = [];
  selectedCarIds: number[] = [];

  @Input() personToEdit?: typeof this.person & {
    id: number;
    cars?: { id: number }[];
  };

  saving = false;
  loadingCars = true;
  carsLoadFailed = false;

  ngOnInit(): void {
    if (this.personToEdit) {
      this.person = { ...this.personToEdit };
      this.selectedCarIds = this.personToEdit.cars?.map((car) => car.id) ?? [];

      this.calculateAge();
    }

    void this.loadCars();
  }

  constructor(
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
  ) {}

  calculateAge(): void {
    this.person.age = null;

    const cnp = this.person.cnp.trim();

    if (!/^[1-6]\d{12}$/.test(cnp)) {
      return;
    }

    const prefix = Number(cnp[0]);
    const century = prefix <= 2 ? 1900 : prefix <= 4 ? 1800 : 2000;

    const year = century + Number(cnp.slice(1, 3));
    const month = Number(cnp.slice(3, 5));
    const day = Number(cnp.slice(5, 7));

    const birthDate = new Date(Date.UTC(year, month - 1, day));

    if (
      birthDate.getUTCFullYear() !== year ||
      birthDate.getUTCMonth() !== month - 1 ||
      birthDate.getUTCDate() !== day
    ) {
      return;
    }

    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Bucharest',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());

    const getPart = (type: string): number =>
      Number(parts.find((part) => part.type === type)!.value);

    const currentYear = getPart('year');
    const currentMonth = getPart('month');
    const currentDay = getPart('day');

    let age = currentYear - year;

    if (currentMonth < month || (currentMonth === month && currentDay < day)) {
      age--;
    }

    this.person.age = age < 0 ? null : age;
  }

  async save(): Promise<void> {
    if (this.saving || this.loadingCars || this.carsLoadFailed) {
      return;
    }

    const lastName = this.person.lastName.trim();
    const firstName = this.person.firstName.trim();
    const cnp = this.person.cnp.trim();

    if (!lastName || lastName.length > 255) {
      this.toastr.error(
        'Numele este obligatoriu și poate avea maximum 255 de caractere.',
      );
      return;
    }

    if (!firstName || firstName.length > 255) {
      this.toastr.error(
        'Prenumele este obligatoriu și poate avea maximum 255 de caractere.',
      );
      return;
    }

    if (!/^\d{13}$/.test(cnp)) {
      this.toastr.error('CNP-ul trebuie să conțină exact 13 cifre.');
      return;
    }

    if (!/^[1-6]/.test(cnp)) {
      this.toastr.error(
        'Calculul vârstei suportă momentan doar CNP-uri care încep cu 1–6.',
      );
      return;
    }

    this.calculateAge();

    if (this.person.age === null) {
      this.toastr.error('Data nașterii din CNP este invalidă sau în viitor.');
      return;
    }

    if (this.selectedCarIds.length === 0) {
      this.toastr.error('Selectați cel puțin o mașină.');
      return;
    }

    const payload = {
      lastName,
      firstName,
      cnp,
      age: this.person.age,
      carIds: [...this.selectedCarIds],
    };

    this.saving = true;

    try {
      if (this.personToEdit?.id !== undefined) {
        await axios.put(`/api/persons/${this.personToEdit.id}`, payload);
      } else {
        await axios.post('/api/persons', payload);
      }
    } catch (error) {
      console.error('Failed to save person:', error);
      this.toastr.error('Eroare la salvarea persoanei.');
      return;
    } finally {
      this.saving = false;
    }

    this.toastr.success('Persoana a fost salvată.');
    this.activeModal.close();
  }

  async loadCars(): Promise<void> {
    this.loadingCars = true;
    this.carsLoadFailed = false;

    try {
      const response =
        await axios.get<{ id: number; brand: string; model: string }[]>(
          '/api/cars',
        );

      this.availableCars = response.data.map((car) => ({
        ...car,
        label: `${car.brand} ${car.model} (#${car.id})`,
      }));
    } catch (error) {
      console.error('Failed to fetch car options:', error);
      this.carsLoadFailed = true;
      this.toastr.error('Eroare la preluarea mașinilor.');
    } finally {
      this.loadingCars = false;
    }
  }
}
