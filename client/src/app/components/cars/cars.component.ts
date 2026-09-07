import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CarModalComponent } from './car-modal/car-modal.component';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import axios from 'axios';
import { ToastrService } from 'ngx-toastr';
import { TableColumn } from '../shared/data-table/data-table.component';
import { NgxSpinnerService } from 'ngx-spinner';

interface Car {
  id: number;
  brand: string;
  model: string;
  manufactureYear: number;
  engineCapacity: number;
  tax: number;
}

@Component({
  selector: 'app-cars',
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.scss'],
})
export class CarsComponent implements OnInit, OnDestroy {
  faPlus = faPlus;

  filters = {
    brand: '',
    model: '',
    manufactureYear: '',
    engineCapacity: '',
    tax: '',
  };

  private filterTimer?: ReturnType<typeof setTimeout>;
  private requestVersion = 0;

  columns: TableColumn[] = [
    {
      key: 'number',
      label: 'Nr. Crt.',
      width: '60px',
      type: 'number',
      center: true,
    },
    { key: 'brand', label: 'Marcă' },
    { key: 'model', label: 'Model' },
    {
      key: 'manufactureYear',
      label: 'Anul fabricației',
      width: '120px',
      center: true,
    },
    {
      key: 'engineCapacity',
      label: 'Capacitate cilindrică',
      width: '160px',
      suffix: ' cm³',
      center: true,
    },
    {
      key: 'tax',
      label: 'Taxă de impozit',
      width: '120px',
      suffix: ' lei',
      center: true,
    },
    {
      key: 'edit',
      label: '',
      width: '35px',
      type: 'edit',
      center: true,
    },
    {
      key: 'delete',
      label: '',
      width: '35px',
      type: 'delete',
      center: true,
    },
  ];

  onFiltersChange(): void {
    clearTimeout(this.filterTimer);
    this.requestVersion++;

    this.filterTimer = setTimeout(() => {
      void this.loadCars();
    }, 300);
  }

  cars: Car[] = [];
  constructor(
    private modalService: NgbModal,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) {}

  ngOnInit(): void {
    void this.loadCars();
  }

  ngOnDestroy(): void {
    clearTimeout(this.filterTimer);
    this.requestVersion++;
    void this.spinner.hide();
  }

  async loadCars(): Promise<void> {
    const version = ++this.requestVersion;
    void this.spinner.show();

    try {
      const response = await axios.get<Car[]>('/api/cars', {
        params: { ...this.filters },
      });

      if (version !== this.requestVersion) {
        return;
      }

      this.cars = response.data;
    } catch (error) {
      if (version !== this.requestVersion) {
        return;
      }

      console.error('Failed to fetch cars:', error);
      this.toastr.error('Eroare la preluarea mașinilor.');
    } finally {
      if (version === this.requestVersion) {
        void this.spinner.hide();
      }
    }
  }

  addCar(): void {
    const modalRef = this.modalService.open(CarModalComponent, {
      size: 'lg',
      backdrop: 'static',
      beforeDismiss: () => !modalRef.componentInstance.saving,
    });

    modalRef.closed.subscribe(() => {
      void this.loadCars();
    });
  }

  async editCar(car: Car): Promise<void> {
    let currentCar: Car;

    try {
      const response = await axios.get<Car>(`/api/cars/${car.id}`);
      currentCar = response.data;
    } catch (error) {
      console.error('Failed to fetch car:', error);
      this.toastr.error('Eroare la preluarea mașinii.');
      return;
    }

    const modalRef = this.modalService.open(CarModalComponent, {
      size: 'lg',
      backdrop: 'static',
      beforeDismiss: () => !modalRef.componentInstance.saving,
    });

    modalRef.componentInstance.carToEdit = currentCar;

    modalRef.closed.subscribe(() => {
      void this.loadCars();
    });
  }

  deleteCar(car: Car): void {
    const modalRef = this.modalService.open(ConfirmDialogComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.componentInstance.title = 'Ștergere mașină';
    modalRef.componentInstance.content = 'Doriți să ștergeți mașina selectată?';

    modalRef.closed.subscribe(() => {
      void this.removeCar(car.id);
    });
  }

  async removeCar(id: number): Promise<void> {
    try {
      await axios.delete(`/api/cars/${id}`);
    } catch (error) {
      console.error('Failed to delete car:', error);
      this.toastr.error('Eroare la ștergerea mașinii.');
      return;
    }

    this.toastr.success('Mașina a fost ștearsă.');
    await this.loadCars();
  }
}
