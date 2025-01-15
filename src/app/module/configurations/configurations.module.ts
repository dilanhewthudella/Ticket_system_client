import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigurationsRoutingModule } from './configurations-routing.module';
import {MaterialModule } from './material-module/material-module.module'


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ConfigurationsRoutingModule,
    MaterialModule 
  ]
})
export class ConfigurationsModule { }
