import { NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {WrapperComponent} from './wrapper/wrapper.component';
import {BreadcrumbModule} from "primeng/breadcrumb";
import {MenuModule} from "primeng/menu";
import {HeaderComponent} from './header/header.component';
import {ContentWrapperComponent} from './content-wrapper/content-wrapper.component';
import {FooterComponent} from './footer/footer.component';
import {MenuComponent} from './menu/menu.component';
import {BodyWrapperComponent} from './body-wrapper/body-wrapper.component';
import {LogoWrapperComponent} from './logo-wrapper/logo-wrapper.component';
import {SubHeaderComponent} from './sub-header/sub-header.component';
import {BreadcrumbComponent} from './breadcrumb/breadcrumb.component';
import {LogoComponent} from './logo/logo.component';
import {AuthWrapperComponent} from './auth-wrapper/auth-wrapper.component';
import {AuthComponent} from './auth/auth.component';
import {CardsComponent} from './cards/cards.component';
import {WizardComponent} from './wizard/wizard.component';
import {FormComponent} from './form/form.component';
import {OverviewComponent} from './overview/overview.component';
import {GraphQLModule} from './graphql.module';
import {HttpClientModule} from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import {RouterModule, Routes} from "@angular/router";
import { InitializerModule } from './initializer/initializer.module';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MenubarModule} from "primeng/menubar";
import {ButtonModule} from "primeng/button";
import {TableModule} from "primeng/table";
import {FormsModule} from "@angular/forms";
import {DropdownModule} from "primeng/dropdown";
import {PanelModule} from "primeng/panel";
import {AutoCompleteModule} from "primeng/autocomplete";
import {CardModule} from "primeng/card";
import {InplaceModule} from "primeng/inplace";
import {StepsModule} from "primeng/steps";
import {DividerModule} from "primeng/divider";
import {RadioButtonModule} from "primeng/radiobutton";
import {ListboxModule} from "primeng/listbox";
import {PickListModule} from "primeng/picklist";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {InputNumberModule} from "primeng/inputnumber";
import {PaginatorModule} from "primeng/paginator";
import {BlockUIModule} from "primeng/blockui";
import {DialogModule} from "primeng/dialog";
import {CheckboxModule} from "primeng/checkbox";
import {ToastModule} from "primeng/toast";
import {InputTextModule} from "primeng/inputtext";
import {FormControlComponent} from "./form/form-control/form-control.component";
import { FormLabelComponent } from './form/form-label/form-label.component';
import {CalendarModule} from "primeng/calendar";
import {ConfirmationService} from "primeng/api";
import { AlertComponent } from './dialogs/alert/alert.component';
import { ConfirmComponent } from './dialogs/confirm/confirm.component';
import { PromptComponent } from './dialogs/prompt/prompt.component';

const routes: Routes = [
  {path:'', pathMatch: 'full', component:HomeComponent},
]

@NgModule({
  declarations: [
    AppComponent,
    WrapperComponent,
    HeaderComponent,
    ContentWrapperComponent,
    FooterComponent,
    MenuComponent,
    BodyWrapperComponent,
    LogoWrapperComponent,
    SubHeaderComponent,
    BreadcrumbComponent,
    LogoComponent,
    AuthWrapperComponent,
    AuthComponent,
    CardsComponent,
    WizardComponent,
    FormComponent,
    OverviewComponent,
    HomeComponent,
    FormControlComponent,
    FormLabelComponent,
    AlertComponent,
    ConfirmComponent,
    PromptComponent
  ],
    imports: [
        BrowserModule,
        BreadcrumbModule,
        MenuModule,
        MenubarModule,
        GraphQLModule,
        HttpClientModule,
        RouterModule.forRoot(routes),
        InitializerModule,
        BrowserAnimationsModule,
        ButtonModule,
        TableModule,
        HttpClientModule,
        FormsModule,
        DropdownModule,
        InputTextModule,
        PanelModule,
        InplaceModule,
        AutoCompleteModule,
        StepsModule,
        CardModule,
        RadioButtonModule,
        DividerModule,
        ListboxModule,
        PickListModule,
        ToastModule,
        CheckboxModule,
        DialogModule,
        ConfirmDialogModule,
        BlockUIModule,
        InputNumberModule,
        BreadcrumbModule,
        PaginatorModule,
        CalendarModule
    ],

  providers: [
    ConfirmationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
  }


}
