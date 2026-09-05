import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

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

  @Input() personToEdit?: typeof this.person;

  ngOnInit(): void {
    if (this.personToEdit) {
      this.person = { ...this.personToEdit };
      this.calculateAge();
    }
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

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();

    if (
      birthDate.getFullYear() !== year ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getDate() !== day ||
      birthDate > today
    ) {
      return;
    }

    let age = today.getFullYear() - year;

    const birthdayHasNotPassed =
      today.getMonth() < month - 1 ||
      (today.getMonth() === month - 1 && today.getDate() < day);

    if (birthdayHasNotPassed) {
      age--;
    }

    this.person.age = age;
  }

  save(): void {
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

    this.activeModal.close({
      lastName,
      firstName,
      cnp,
      age: this.person.age,
    });
  }
}
