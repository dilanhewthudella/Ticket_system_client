import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Subscription } from 'rxjs';
import { ConfigurationsService } from '../../core/services/configurations.service';
import { ConfigModel } from '../../core/models/configuration.model';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { WebsocketService } from '../../core/services/websocket.service';
import { MatTabsModule } from '@angular/material/tabs';
import Swal from 'sweetalert2';
import { response } from 'express';

@Component({
  selector: 'app-configurations',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatGridListModule,
    MatCardModule,
    MatTabsModule,
  ],
  templateUrl: './configurations.component.html',
  styleUrl: './configurations.component.css',
})
export class ConfigurationsComponent {
  configForm!: FormGroup;
  ticketAddForm!: FormGroup;
  ticketPurchaseForm!: FormGroup;
  statusString = 'Simulation stopped';
  currentStatus: ConfigModel = {
    maxTickets: 0,
    ticketReleaseRate: 0,
    customerRetrievalRate: 0,
  };
  ticketUpdate: any[] = [];

  startSubscription$!: Subscription;
  stopSubscription$!: Subscription;
  updateConfigSubscription$!: Subscription;
  getStatusSubscription$!: Subscription;
  getTicketUpdatesSubscription$!: Subscription;
  addTicketSubscription$!: Subscription;
  purchaseTicketSubscription$!: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private _configService: ConfigurationsService,
    private _webSocketService: WebsocketService
  ) {
    this.getTicketUpdates();
  }
  ngOnInit() {
    this.createForm();
    this.createTicketAddForm();
    this.createTicketPurchaseForm();
    this.getStatus();
  }
  getTicketUpdates() {
    this._webSocketService
      .getTicketUpdates('ticketsUpdate')
      .subscribe((data) => {
        this.ticketUpdate.push(data);
      });
    console.log(this.ticketUpdate);
  }
  createForm() {
    this.configForm = this.formBuilder.group({
      maxTickets: [null, [Validators.required, this.nonNegativeValidator]],
      ticketReleaseRate: [
        null,
        [Validators.required, this.nonNegativeValidator],
      ],
      customerRetrievalRate: [
        null,
        [Validators.required, this.nonNegativeValidator],
      ],
    });
  }

  createTicketAddForm() {
    this.ticketAddForm = this.formBuilder.group({
      eventName: [null, Validators.required],
      noOfTickets: [null, [Validators.required, this.nonNegativeValidator]],
    });
  }

  createTicketPurchaseForm() {
    this.ticketPurchaseForm = this.formBuilder.group({
      eventName: [null, Validators.required],
      noOfTickets: [null, [Validators.required, this.nonNegativeValidator]],
    });
  }

  nonNegativeValidator(control: any) {
    const value = control.value;
    return value < 0 ? { negative: true } : null; // Return error object if negative
  }

  startConfig() {
    this.startSubscription$ = this._configService
      .startConfiguration('start')
      .subscribe({
        next: (response) => {
          this.statusString = response.message;
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Simulation started running',
            showConfirmButton: false,
            timer: 1500,
          });
          this.getTicketUpdates();
        },
        error: (error) => {
          console.log(error.status);
          if (error.status == 400) {
            this.statusString = 'Simulation already running';
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: this.statusString,
            });
          } else
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Something went wrong!',
              footer: '<a href="#">Why do I have this issue?</a>',
            });
        },
      });
  }

  stopConfig() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Simulation work will end!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.stopSubscription$ = this._configService
          .stopConfiguration('stop')
          .subscribe({
            next: (response) => {
              this.statusString = response.message;
            },
            error: (error) => {
              this.statusString = error.message;
            },
          });
        Swal.fire({
          title: 'Done',
          text: 'Simulation Ended.',
          icon: 'success',
        });
      }
    });
  }

  onSubmit(config: any) {
    this.updateConfigSubscription$ = this._configService
      .updateConfiguration('configure', config)
      .subscribe({
        next: (response) => {
          console.log(response);
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Configurations updated Successfully',
            showConfirmButton: false,
            timer: 1500,
          });
          this.getStatus();
          this.resetForm();
        },
        error: (error) => {
          console.log(error);
        },
      });
  }

  getStatus() {
    this.getStatusSubscription$ = this._configService
      .getStatus('status')
      .subscribe({
        next: (response) => {
          this.currentStatus = response;
        },
      });
  }

  resetForm() {
    this.configForm.get('maxTickets')?.disable();
    this.configForm.get('ticketReleaseRate')?.disable();
    this.configForm.get('customerRetrievalRate')?.disable();
    this.configForm.reset();
    this.configForm.get('maxTickets')?.enable();
    this.configForm.get('ticketReleaseRate')?.enable();
    this.configForm.get('customerRetrievalRate')?.enable();
  }

  addTickets() {
    this.purchaseTicketSubscription$ = this._configService
      .addTickets('addTickets', this.ticketAddForm.value)
      .subscribe({
        next: (response) => {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: response.message,
            showConfirmButton: false,
            timer: 1500,
          });
        },
        error: (error) => {
          if (error.status == 400) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Not enough space to add tickets ',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Something went wrong!',
            });
          }
        },
      });
  }

  purchaseTickets() {
    this.addTicketSubscription$ = this._configService
      .purchaseTicket('purchase', this.ticketPurchaseForm.value)
      .subscribe({
        next: (response) => {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: response.message,
            showConfirmButton: false,
            timer: 1500,
          });
        },
        error: (error) => {
          if (error.status == 400) {
            Swal.fire({
              icon: 'error',
              title: 'We are Sorry.',
              text: 'Not enough tickets available',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Something went wrong!',
            });
          }
        },
      });
  }
}
