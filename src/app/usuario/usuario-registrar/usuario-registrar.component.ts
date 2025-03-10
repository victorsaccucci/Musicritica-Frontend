import { Component, ViewChild } from '@angular/core';
import { UsuarioService } from 'src/app/shared/service/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuario-registrar',
  templateUrl: './usuario-registrar.component.html',
  styleUrls: ['./usuario-registrar.component.scss'],
})
export class UsuarioRegistrarComponent {
  nome: string;
  email: string;
  senha: string;
  dt_cadastro: string;

  constructor(private usuarioService: UsuarioService, private router: Router) {}

  registrar() {
    this.usuarioService.registrar({ nome: this.nome, email: this.email, senha: this.senha })
      .subscribe(
        (response) => {
          console.log(response.message);
          this.router.navigate(['usuario/login']);
        },
        (error) => {
          console.error('Erro no registro', error);
        }
      );
  }

  fazerLogin() {
    this.router.navigate(['usuario/login']);
  }

}
