import {
  Component,
  ContentChild,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  Output,
  EventEmitter,
} from '@angular/core';

import {
  faChevronUp,
  faEdit,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';

import { SCROLL_TOP, SET_HEIGHT } from 'src/app/utils/utils-table';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  type?: 'text' | 'number' | 'edit' | 'delete' | 'custom';
  suffix?: string;
  center?: boolean;
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent<T> implements OnInit, OnChanges {
  @Input() rows: T[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() loading = false;
  @Input() emptyMessage = 'Date inexistente!';

  @Output() editRow = new EventEmitter<T>();
  @Output() deleteRow = new EventEmitter<T>();

  @ContentChild('customCell')
  customCell?: TemplateRef<{
    $implicit: T;
    column: TableColumn;
  }>;

  @ContentChild('filterTemplate')
  filterTemplate?: TemplateRef<unknown>;

  faChevronUp = faChevronUp;
  faEdit = faEdit;
  faTrashAlt = faTrashAlt;
  limit = 70;
  showBackTop = false;

  ngOnInit(): void {
    SET_HEIGHT('view', 20, 'height');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows']) {
      this.onScrollTop();
    }
  }

  displayValue(row: T, column: TableColumn): string {
    const value = row[column.key as keyof T];

    return value === null || value === undefined
      ? '—'
      : `${String(value)}${column.suffix ?? ''}`;
  }

  @HostListener('window:resize')
  onResize(): void {
    SET_HEIGHT('view', 20, 'height');
  }

  showTopButton(): void {
    const view = document.getElementsByClassName('view-scroll-table')[0];

    this.showBackTop = !!view && view.scrollTop > 500;
  }

  onScrollDown(): void {
    this.limit += 20;
  }

  onScrollTop(): void {
    SCROLL_TOP('view-scroll-table', 0);
    this.limit = 70;
    this.showBackTop = false;
  }
}
