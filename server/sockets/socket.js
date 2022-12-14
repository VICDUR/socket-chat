const { io } = require('../server');
const {Usuarios} = require('../clasess/usuarios');
const { crearMensaje } = require('../utils/utilidades'); 


const usuarios = new Usuarios()

io.on('connection', (client) => {

   client.on('entrarChat', (usuario, callback) => {
        if(!usuario.nombre || !usuario.sala ){
            return callback({
                error: true,
                msg: 'El nombre/sala es necesario'
            }); 
        };

        // unir chat a una misma sala 
        client.join(usuario.sala);

        usuarios.agregarPersona( client.id, usuario.nombre, usuario.sala );
        
        // emite la informacion a la sala
        client.broadcast.to(usuario.sala).emit('listaPersonas', usuarios.getPersonasPorSalas ());

        return callback(usuarios.getPersonasPorSalas(usuario.sala));
   });



    client.on('crearMensaje', (data)=> {

        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje)
    });



   client.on('disconnect', ()=> {
        let personaBorrada = usuarios.borrarPersona( client.id );

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} salio`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuarios.getPersonasPorSalas (personaBorrada.sala ));
   });

   //Mensaje Privado
   client.on('mensajePrivado', (data)=>{
        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));
   })
    

});