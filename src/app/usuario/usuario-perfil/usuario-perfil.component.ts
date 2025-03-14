import { UsuarioService } from 'src/app/shared/service/usuario.service';
import { Component, OnInit } from '@angular/core';
import { Usuario } from 'src/app/shared/model/Usuario';
import { ActivatedRoute } from '@angular/router';
import { PlaylistService } from 'src/app/shared/service/playlist.service';
import { Playlist } from 'src/app/shared/model/Playlist';
import { ListaTracksSpotify } from 'src/app/shared/model/ListaTracksSpotify';
import { DadosCompartilhadosService } from 'src/app/shared/service/dados-compartilhados.service';



@Component({
  selector: 'app-usuario-perfil',
  templateUrl: './usuario-perfil.component.html',
  styleUrls: ['./usuario-perfil.component.scss'],

})
export class UsuarioPerfilComponent implements OnInit{

  usuario: Usuario;
  imagemPerfil: number[];

  constructor(
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private playListService: PlaylistService,
    private dadosCompartilhadosService: DadosCompartilhadosService
  ) { }

  conteudoSelecionado: string | null = null;
  novaPlaylist: Playlist = new Playlist();
  playlistsDoUsuario: Playlist[];

  mostrarDropdown: { [key: number]: boolean } = {};

  primeirasMusicasDasPlaylists: { [key: number]: string } = {};

  musicasDaPlaylist: ListaTracksSpotify = new ListaTracksSpotify();

  exibirEditButtons: boolean = false;
  isModalOpen: boolean;
  novoNome: string;
  novaImagemPerfil: File;
  novaImagemBackground: File;

  pageId: string | null;

  ngOnInit(): void {
    this.usuarioService.getToken();
    this.route.paramMap.subscribe(params => {
      this.pageId = params.get('id');
      if (this.pageId) {
        this.buscarUsuario(+this.pageId);
        this.buscarPlaylistsPorIdUsuario(+this.pageId);
        this.dadosCompartilhadosService.setPageId(this.pageId);
      }
      console.log("Id da pagina:", this.pageId);
    });
  }

  mostrarConteudo(opcao: string): void {
    this.conteudoSelecionado = opcao;

  }

  buscarUsuario(idUsuario: number): void {
    this.usuarioService.buscarUsuarioPorId(idUsuario).subscribe(
      (usuario: Usuario) => {
        this.usuario = usuario;
        console.log("Usuario buscado:", usuario);
      },
      (error) => {
        console.error("Erro ao buscar usuário:", error);
      }
    );
  }

  buscarPlaylistsPorIdUsuario(idUsuario: number): void {
    this.playListService.buscarPlaylistsPorIdUsuario(idUsuario).subscribe(
      (data: Playlist[]) => {
        this.playlistsDoUsuario = data;
        this.playlistsDoUsuario.forEach(playlist => {
          this.buscarTodasMusicasDaPlaylist(playlist.id);
        });
        console.log(data);
      },
      (error) => {
        console.error('Ocorreu um erro ao buscar as músicas:', error);
      }
    );
  }

  buscarTodasMusicasDaPlaylist(id: number): void {
    this.playListService.buscarTodasMusicasDaPlaylist(id).subscribe(
      (data: ListaTracksSpotify) => {
        if (data.tracks && data.tracks.length > 0) {
          const primeiraMusica = data.tracks[0];
          const imageUrl = primeiraMusica.album.images.length > 0 ? primeiraMusica.album.images[0].url : '';
          this.primeirasMusicasDasPlaylists[id] = imageUrl;
        }
        this.musicasDaPlaylist = data;

      },
      (error) => {
        console.error('Ocorreu um erro ao buscar o as músicas do álbum:', error);
      }
    );
  }

  toggleDropdown(playlist: Playlist, event: Event): void {
    event.stopPropagation();
    if (!this.mostrarDropdown[playlist.id]) {
      this.fecharTodosDropdowns();
    }
    this.mostrarDropdown[playlist.id] = !this.mostrarDropdown[playlist.id];
  }

  fecharTodosDropdowns(): void {
    this.playlistsDoUsuario.forEach(playlist => {
      this.mostrarDropdown[playlist.id] = false;
    });
  }

  editarNome(): void {
    this.isModalOpen = true;
  }

  fecharModal(): void {
    this.isModalOpen = false;
  }

  salvarNome(): void {
    if (this.novoNome) {
      this.usuarioService.atualizarUsuario(this.novoNome).subscribe(
        response => {
          this.usuario.nome = this.novoNome;
          this.fecharModal();
          console.log('Nome atualizado com sucesso');
        },
        error => {
          console.error('Erro ao atualizar nome:', error);
        }
      );
    } else {
      console.error('Novo nome não fornecido');
    }
  }

  alterarImagem(tipo: string): void {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = 'image/*';
    inputElement.addEventListener('change', (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        if (tipo === 'perfil') {
          this.novaImagemPerfil = file;
          this.atualizarImagemPerfil();
        } else if (tipo === 'background') {
          this.novaImagemBackground = file;
          this.atualizarImagemBackground();
        }
      }
    });
    inputElement.click();
  }

  atualizarImagemPerfil(): void {
    if(this.novaImagemPerfil){
      this.usuarioService.atualizarUsuario(undefined, this.novaImagemPerfil, undefined).subscribe(
        response => {
          console.log('Imagem alterada com sucesso');
        },
        error => {
          console.error('Erro ao atualizar imagem:', error);
        }
      );
    }
  }

  atualizarImagemBackground(): void {
    if(this.novaImagemBackground){
      this.usuarioService.atualizarUsuario(undefined, undefined, this.novaImagemBackground).subscribe(
        response => {
          console.log('Imagem alterada com sucesso');
        },
        error => {
          console.error('Erro ao atualizar imagem:', error);
        }
      );
    }
  }
}
