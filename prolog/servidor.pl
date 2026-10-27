
:- use_module(library(http/http_server)).
:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).
:- use_module(library(http/http_cors)).


:- http_handler(root(api/catalogo), api_catalogo, []).
:- http_handler(root(api/catalogo/agregar), api_agregar_catalogo, [methods([post, options])]).

iniciar_servidor :-
    http_server(http_dispatch, [port(8000)]),
    format('PC Advisor disponible en http://localhost:8000/api/catalogo~n', []).


:- consult('c:/Users/moise/Documents/GitHub/desktop-tutorial/proyecto compu precio/prolog/catalogo.pl').


api_catalogo(Request) :-
    format('Access-Control-Allow-Origin: *~n', []),
    format('Access-Control-Allow-Methods: GET, POST, OPTIONS~n', []),
    format('Access-Control-Allow-Headers: Content-Type~n', []),
    cors_enable(Request, [methods([get, options])]),
    (   memberchk(method(options), Request)
    ->  reply_json_dict(_{status: "ok"})
    ;   findall(
            _{
                id: ID,
                marca: Marca,
                modelo: Modelo,
                precio: Precio,
                tipo: Tipo,
                perfil: Perfil,      
                procesador: CPU,
                ram: RAM,
                almacenamiento: Disco,
                tipo_disco: TipoDisco,
                graficos: GPU,
                imagen: Imagen,
                tienda: Tienda
            },
            ficha_tecnica(ID, Marca, Modelo, Precio, Tipo, Perfil, CPU, RAM, Disco, TipoDisco, GPU, Imagen, Tienda),
            Equipos
        ),
        reply_json_dict(_{equipos: Equipos})
    ).


api_agregar_catalogo(Request) :-
    format('Access-Control-Allow-Origin: *~n', []),
    format('Access-Control-Allow-Methods: GET, POST, OPTIONS~n', []),
    format('Access-Control-Allow-Headers: Content-Type~n', []),
    cors_enable(Request, [methods([post, options]), headers(['Content-Type'])]),
    (   memberchk(method(options), Request)
    ->  reply_json_dict(_{status: "ok"})
    ;   http_read_json_dict(Request, Data),


        findall(IdExistente, ficha_tecnica(IdExistente,_,_,_,_,_,_,_,_,_,_,_,_), ListaEquipos),
        length(ListaEquipos, Total),
        SiguienteNumero is Total + 1,
        atomic_list_concat([pc, SiguienteNumero], ID), 

        atom_string(Marca, Data.marca),
        atom_string(Modelo, Data.modelo),
        Precio = Data.precio,
        atom_string(Tipo, Data.tipo),
        atom_string(Perfil, Data.perfil), 
        atom_string(CPU, Data.procesador),
        RAM = Data.ram,
        Disco = Data.almacenamiento,
        atom_string(TipoDisco, Data.tipo_disco),
        atom_string(GPU, Data.graficos),
        atom_string(Imagen, Data.imagen),
        atom_string(Tienda, Data.tienda),


        assertz(ficha_tecnica(ID, Marca, Modelo, Precio, Tipo, Perfil, CPU, RAM, Disco, TipoDisco, GPU, Imagen, Tienda)),

        RutaCatalogo = 'c:/Users/moise/Documents/GitHub/desktop-tutorial/proyecto compu precio/prolog/catalogo.pl',
        open(RutaCatalogo, append, Stream),
        format(Stream, '~nficha_tecnica(~q, ~q, ~q, ~d, ~q, ~q, ~q, ~d, ~d, ~q, ~q, ~q, ~q).',
               [ID, Marca, Modelo, Precio, Tipo, Perfil, CPU, RAM, Disco, TipoDisco, GPU, Imagen, Tienda]),
        close(Stream),

        reply_json_dict(_{status: "success", message: "Equipo agregado correctamente"})
    ).

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
