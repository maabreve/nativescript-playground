const url = "appportalinea.sinax.com.br";
// const url = "192.168.0.11:8080"; // Maquina Carlos
// const url =  "VISIONPC138.visionnaire.local:8080"; // Maquina Carlos
// const url = "VISIONPC137:8080"; // Maquina Wesley 
// const url = "inea.visionnaire.com.br:8080"; // Servidor


export class Config {
  static apiUrlObterVersoes = "http://" + url +  "/json/getVersao";
  static apiUrlMenu = "http://" + url + "/json/getMenus";
  static apiUrlAtividade = "http://" + url + "/json/getAtividades";
  static apiUrlMunicipio = "http://" + url + "/json/getMunicipios";
  static apiUrlCriarProcesso = "http://" + url + "/json/criarProcesso";
  static apiUrlGravarRespostas = "http://" + url + "/json/recebeRespostas";
  static apiUrlAgendaLivre = "http://" + url + "/json/listaDataLivre";
  static apiUrlAddEventoAgendaLivre = "http://" + url + "/json/addEventoAgendaLivre";
  static apiUrlObterTipoLicencas = "http://" + url + "/json/getTipoLicencas";
  static apiUrlObterDocumentoMenu = "http://" + url + "/json/getDocumentoMenu";
  static apiUrlCriarUsuario = "http://" + url + "/json/criarUsuario";
  static apiUrlLogin = "http://" + url + "/json/login";
  static apiUrlRecuperarSenha = "http://" + url + "/json/enviarEmailEsqueciMinhaSenha";
  static apiUrlVerificarSocialLogin = "http://" + url + "/json/verificarSocialLogin";
  static apiUrlObterAgendamentoUsuario = "http://" + url + "/json/listarAgendamentoUsuario";
  static apiUrlDeletarAgendamentoUsuario = "http://" + url + "/json/deletarAgendamentoUsuario";

  static apiUrlGoogleGeocode = "https://maps.googleapis.com/maps/api/geocode/json";
  static googleGeocodeKey = "AIzaSyC7fHiSDaUpfgIDSXE0V45pw63f-KINJes";
}