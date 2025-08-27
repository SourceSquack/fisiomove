import { Component } from '@angular/core';

@Component({
  selector: 'app-calendar',
  imports: [],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  text: string = 'Settings works!';

  services = [
    {
      id: 1,
      name: "Fisioterapia deportiva",
      description: "Especializada en lesiones deportivas y recuperación atlética."
    },
    {
      id: 2,
      name: "Rehabilitación ortopédica",
      description: "Tratamiento integral para lesiones musculoesqueléticas."
    },
    {
      id: 3,
      name: "Terapia manual",
      description: "Técnicas manuales avanzadas para el alivio del dolor."
    },
    {
      id: 4,
      name: "Fisioterapia neurológica",
      description: "Especializada en trastornos del sistema nervioso"
    }
  ]

  appointmentsType = [
    {
      id: 1,
      name: "Valoración",
      description: "Valoraciónaskdjfhalkd kasjdfñlkasjdf alsñkdjfañldkfj",
      duration: 30,
    },
    {
      id: 2,
      name: "Rehabilitación deportiva",
      description: "Rehabilitaciónasdp aslkdjfalkdfjlasdkfja ldkjasdlfkjdsl lkj",
      duration: 60,
    },
    {
      id: 3,
      name: "Seguimiento",
      description: "Seguimiensl aksdjfla aljskdfjdf ajsdfadsf laldskjfasd ",
      duration: 30,
    }
  ]

  aboutText = " Con más de 10 años de experiencia en el sector de la fisioterapia, FisioMove se ha consolidado como un centro de referencia en tratamientos de rehabilitación y bienestar físico. Nuestro compromiso es brindar atención personalizada y de calidad, utilizando las técnicas más avanzadas y un enfoque integral que considera tanto los aspectos físicos como emocionales de nuestros pacientes."
}
