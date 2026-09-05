import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CarModalComponent } from './car-modal/car-modal.component';
import {
  faPlus,
  faEdit,
  faTrashAlt,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { SCROLL_TOP, SET_HEIGHT } from 'src/app/utils/utils-table';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import axios from 'axios';
import { ToastrService } from 'ngx-toastr';

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
export class CarsComponent implements OnInit {
  faPlus = faPlus;
  faEdit = faEdit;
  faTrashAlt = faTrashAlt;
  faChevronUp = faChevronUp;
  limit = 70;
  showBackTop = false;
  filters = {
    brand: '',
    model: '',
    manufactureYear: '',
    engineCapacity: '',
    tax: '',
  };

  get filteredCars(): Car[] {
    const matches = (value: string | number, search: string): boolean =>
      String(value)
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase());

    return this.cars.filter(
      (car) =>
        matches(car.brand, this.filters.brand) &&
        matches(car.model, this.filters.model) &&
        matches(car.manufactureYear, this.filters.manufactureYear) &&
        matches(car.engineCapacity, this.filters.engineCapacity) &&
        matches(car.tax, this.filters.tax),
    );
  }

  onFiltersChange(): void {
    this.onScrollTop();
    this.showBackTop = false;
  }

  cars: Car[] = [];
  constructor(
    private modalService: NgbModal,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    SET_HEIGHT('view', 20, 'height');
    void this.loadCars();
  }

  showTopButton(): void {
    const view = document.getElementsByClassName('view-scroll-cars')[0];
    this.showBackTop = !!view && view.scrollTop > 500;
  }

  onScrollDown(): void {
    this.limit += 20;
  }

  onScrollTop(): void {
    SCROLL_TOP('view-scroll-cars', 0);
    this.limit = 70;
  }

  async loadCars(): Promise<void> {
    try {
      const response = await axios.get<Car[]>('/api/cars');
      this.cars = response.data;
    } catch (error) {
      console.error('Failed to fetch cars:', error);
      this.toastr.error('Eroare la preluarea mașinilor.');
    }
  }

  addCar(): void {
    const modalRef = this.modalService.open(CarModalComponent, {
      size: 'lg',
      backdrop: 'static',
    });

    modalRef.closed.subscribe((car: Omit<Car, 'id'>) => {
      void this.createCar(car);
    });
  }

  async createCar(car: Omit<Car, 'id'>): Promise<void> {
    try {
      await axios.post('/api/cars', car);
    } catch (error) {
      console.error('Failed to create car:', error);
      this.toastr.error('Eroare la salvarea mașinii.');
      return;
    }

    this.toastr.success('Mașina a fost salvată.');
    await this.loadCars();
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
    });

    modalRef.componentInstance.carToEdit = currentCar;

    modalRef.closed.subscribe((updatedCar: Omit<Car, 'id'>) => {
      void this.updateCar(currentCar.id, updatedCar);
    });
  }

  async updateCar(id: number, car: Omit<Car, 'id'>): Promise<void> {
    try {
      await axios.put(`/api/cars/${id}`, car);
    } catch (error) {
      console.error('Failed to update car:', error);
      this.toastr.error('Eroare la modificarea mașinii.');
      return;
    }

    this.toastr.success('Mașina a fost modificată.');
    await this.loadCars();
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
