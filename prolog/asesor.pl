
:- consult('c:/Users/moise/Documents/GitHub/desktop-tutorial/proyecto compu precio/prolog/catalogo.pl').



consultar_equipo(ID, Marca, Modelo) :- 
    ficha_tecnica(ID, Marca, Modelo, _, _, _, _, _, _, _, _, _, _).

consultar_precio(ID, Precio, catalogo, ano2026) :- 
    ficha_tecnica(ID, _, _, Precio, _, _, _, _, _, _, _, _, _).

consultar_tipo(ID, Tipo) :- 
    ficha_tecnica(ID, _, _, _, Tipo, _, _, _, _, _, _, _, _).

consultar_perfil(ID, Perfil) :- 
    ficha_tecnica(ID, _, _, _, _, Perfil, _, _, _, _, _, _, _).

consultar_procesador(ID, CPU) :- 
    ficha_tecnica(ID, _, _, _, _, _, CPU, _, _, _, _, _, _).

consultar_ram(ID, RAM) :- 
    ficha_tecnica(ID, _, _, _, _, _, _, RAM, _, _, _, _, _).

consultar_disco(ID, Capacidad, TipoDisco) :- 
    ficha_tecnica(ID, _, _, _, _, _, _, _, Capacidad, TipoDisco, _, _, _).

consultar_graficos(ID, ModeloGPU, tipo) :- 
    ficha_tecnica(ID, _, _, _, _, _, _, _, _, _, ModeloGPU, _, _).

consultar_ficha(ID, Marca, Modelo, Precio, Tipo, Perfil, CPU, RAM, Disco, TipoDisco, GPU, Imagen, Tienda) :-
    ficha_tecnica(ID, Marca, Modelo, Precio, Tipo, Perfil, CPU, RAM, Disco, TipoDisco, GPU, Imagen, Tienda).
