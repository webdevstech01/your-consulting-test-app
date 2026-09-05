import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-car-modal',
  templateUrl: './car-modal.component.html',
  styleUrls: ['./car-modal.component.scss'],
})
export class CarModalComponent implements OnInit {
  car = {
    brand: '',
    model: '',
    manufactureYear: null as number | null,
    engineCapacity: null as number | null,
    tax: null as number | null,
  };

  @Input() carToEdit?: typeof this.car;

  ngOnInit(): void {
    if (this.carToEdit) {
      this.car = { ...this.carToEdit };
      this.calculateTax();
    }
  }

  calculateTax(): void {
    const capacity = this.car.engineCapacity;

    if (capacity === null || capacity <= 0) {
      this.car.tax = null;
      return;
    }

    if (capacity < 1500) {
      this.car.tax = 50;
    } else if (capacity <= 2000) {
      this.car.tax = 100;
    } else {
      this.car.tax = 200;
    }
  }

  save(): void {
    const { brand, model, manufactureYear, engineCapacity } = this.car;

    if (!brand.trim() || brand.trim().length > 255) {
      this.toastr.error(
        'Marca este obligatorie și poate avea maximum 255 de caractere.',
      );
      return;
    }

    if (!model.trim() || model.trim().length > 255) {
      this.toastr.error(
        'Modelul este obligatoriu și poate avea maximum 255 de caractere.',
      );
      return;
    }

    if (
      manufactureYear === null ||
      !Number.isInteger(manufactureYear) ||
      manufactureYear < 1 ||
      manufactureYear > 9999
    ) {
      this.toastr.error(
        'Anul fabricației trebuie să fie un număr întreg între 1 și 9999.',
      );
      return;
    }

    if (
      engineCapacity === null ||
      !Number.isInteger(engineCapacity) ||
      engineCapacity < 1 ||
      engineCapacity > 9999
    ) {
      this.toastr.error(
        'Capacitatea cilindrică trebuie să fie un număr întreg între 1 și 9999.',
      );
      return;
    }

    this.calculateTax();

    this.activeModal.close({
      ...this.car,
      brand: brand.trim(),
      model: model.trim(),
    });
  }

  constructor(
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
  ) {}
}
