import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class CarsComponent implements OnInit, OnDestroy {
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

  private filterTimer?: ReturnType<typeof setTimeout>;
  private requestVersion = 0;

  onFiltersChange(): void {
    clearTimeout(this.filterTimer);
    this.requestVersion++;

    this.onScrollTop();
    this.showBackTop = false;

    this.filterTimer = setTimeout(() => {
      void this.loadCars();
    }, 300);
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

  ngOnDestroy(): void {
    clearTimeout(this.filterTimer);
    this.requestVersion++;
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
    const version = ++this.requestVersion;

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
