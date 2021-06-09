const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const path = require('path');
const cors = require('cors');

const PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname,'/public')));
app.use(cors());

const images = ['king.jpg','soldier.jpg','thief.jpg','wazir.jpg'];
let temparr = [0,1,2,3];
temparr = temparr.sort(() => Math.random()-0.5);
let present = [true,true,true,true];



io.on('connection',async (socket)=>{
    socket.on('new_user_joinded',({name,roomname})=>{
        clients = io.sockets.adapter.rooms.get(roomname);
        let found =false;
        if (clients!==undefined){
            for (let ele of clients){
                var tempsocket = io.sockets.sockets.get(ele);
                if (tempsocket.data.name===name){
                    let msg = `User: ${name} is already in room. Try joining with other user name`;
                    socket.emit('redirect',{msg});
                    found=true;
                    break;
                }
            }
        } 
        if (found){
             // nothing
        }
        else if (clients===undefined || clients.size<=2){
            socket.data.score=0;
            socket.emit('my_score');
            socket.to(roomname).emit('other_score',(name));
            if (clients!==undefined){
                for (let ele of clients){
                    var tempsocket = io.sockets.sockets.get(ele);
                    let name = tempsocket.data.name;
                    socket.emit('other_score',(name));
                }
            }
            socket.join(roomname);
            socket.data.name = name;
            socket.data.imgsrc = 'img_avatar.jpg';
            let imgsrc = socket.data.imgsrc;
            socket.emit('showtome',{name,imgsrc});
            if (clients){
                for (let ele of clients){
                    if (ele!=socket.id){
                        var tempsocket = io.sockets.sockets.get(ele);
                        let tempname = tempsocket.data.name;
                        let tempimgsrc = tempsocket.data.imgsrc;
                        socket.emit('initialize',{tempname,tempimgsrc});
                    }
                }
            } 
            socket.to(roomname).emit('user-joined',{name,imgsrc});
            // socket.broadcast.emit('user-joined',{name,imgsrc});
        }
        else if (clients.size===3){
            socket.emit('my_score');
            socket.data.score=0;
            socket.to(roomname).emit('other_score',(name));
            for (let ele of clients){
                var tempsocket = io.sockets.sockets.get(ele);
                let name = tempsocket.data.name;
                socket.emit('other_score',(name));
            }
            socket.data.name = name;
            socket.join(roomname);
            io.to(roomname).emit('started');
            clients = io.sockets.adapter.rooms.get(roomname); 
            temparr = temparr.sort(() => Math.random()-0.5);
            let i=0;
            socket.to(roomname).emit('clear_both_line');
            let target='';  // socket with wazir image
            for (let ele of clients){
                var tempsocket = io.sockets.sockets.get(ele);
                tempsocket.data.imgsrc = images[temparr[i]];
                if (images[temparr[i]]==='wazir.jpg') target = tempsocket.id;
                i++;
            }
            let firstsocket = io.sockets.sockets.get(target);
            name = firstsocket.data.name;
            let imgsrc = firstsocket.data.imgsrc;
            firstsocket.emit('showtome',{name,imgsrc});
            let tempname = firstsocket.data.name;let tempimgsrc=firstsocket.data.imgsrc;
            firstsocket.to(roomname).emit('initialize',{tempname,tempimgsrc});
            for (let ele of clients){
                if (ele!=target){
                    var tempsocket = io.sockets.sockets.get(ele);
                    name = tempsocket.data.name;
                    imgsrc = tempsocket.data.imgsrc;
                    tempname = name;tempimgsrc = imgsrc;
                    tempsocket.emit('showtome',{name,imgsrc});
                    tempsocket.to(roomname).emit('initialize',{tempname,tempimgsrc});
                    i++;
                }
            }
        }
        else{
            let msg = `Room ${roomname} is full. Try joining other rooms`
            socket.emit('redirect',{msg});
            //redirect to 'room full ' page
            //window.location.replace("index.html");
            //document.location.href = "index.html";
        }
    })

    socket.on('show_images',()=>{
        socket.emit('permission');
    })
    socket.on('selected',({color,tempname,roomname})=>{
        socket.to(roomname).emit('showcolors',{color,tempname});
    })
    socket.on('updatescore',({name,myscore,roomname})=>{
        socket.to(roomname).emit('updateotherscore',{name,myscore});
    })
    socket.on('showmsgtoall',({name,data,roomname})=>{
        socket.to(roomname).emit('someonemsg',{name,data});
    })
    socket.on('updatethiefscr',({roomname})=>{
        clients = io.sockets.adapter.rooms.get(roomname); 
        for (let ele of clients){
            var tempsocket = io.sockets.sockets.get(ele);
            if (tempsocket.data.imgsrc==='thief.jpg'){
                tempsocket.emit('youarethief');
                let sc = tempsocket.data.score;
                tempsocket.data.score = sc + 800;
                break;
            }
        }
    })
    socket.on('returnedfromthief',({name,myscore,roomname})=>{
        socket.to(roomname).emit('thiefscore',{name,myscore});
    })
    socket.on('updatesoldierscr',({roomname})=>{
        clients = io.sockets.adapter.rooms.get(roomname); 
        for(let ele of clients){
            var tempsocket = io.sockets.sockets.get(ele);
            if (tempsocket.data.imgsrc==='soldier.jpg'){
                tempsocket.emit('youaresoldier');
                let sc = tempsocket.data.score;
                tempsocket.data.score = sc + 500;
                break;
            }
        }
    })
    socket.on('returnedfromsoldier',({name,myscore,roomname})=>{
        socket.to(roomname).emit('updatesoldier',{name,myscore});
    })
    socket.on('restart',(roomname)=>{
        temparr = temparr.sort(() => Math.random()-0.5);
        clients = io.sockets.adapter.rooms.get(roomname);
        if (clients!==undefined){
            let i=0;
            socket.to(roomname).emit('clear_both_line');
            let target='';  // socket with wazir image
            for (let ele of clients){
                var tempsocket = io.sockets.sockets.get(ele);
                tempsocket.data.imgsrc = images[temparr[i]];
                if (images[temparr[i]]==='wazir.jpg') target = tempsocket.id;
                i++;
            }
            let firstsocket = io.sockets.sockets.get(target);
            name = firstsocket.data.name;
            let imgsrc = firstsocket.data.imgsrc;
            firstsocket.emit('showtome',{name,imgsrc});
            let tempname = firstsocket.data.name;let tempimgsrc=firstsocket.data.imgsrc;
            firstsocket.to(roomname).emit('initialize',{tempname,tempimgsrc});
            for (let ele of clients){
                if (ele!=target){
                    var tempsocket = io.sockets.sockets.get(ele);
                    name = tempsocket.data.name;
                    imgsrc = tempsocket.data.imgsrc;
                    tempname = name;tempimgsrc = imgsrc;
                    tempsocket.emit('showtome',{name,imgsrc});
                    tempsocket.to(roomname).emit('initialize',{tempname,tempimgsrc});
                }
            }
        }
    })
    socket.on('iamking',()=>{
        let sc = socket.data.score;
        socket.data.score = sc + 1000;
    })
    socket.on('iamwazir',()=>{
        let sc = socket.data.score;
        socket.data.score = sc + 800;
    })
    socket.on('disconnecting',()=>{
        let tempname = socket.data.name;
        let temproomname;
        
        let temp = socket.rooms;
        for (let ele of temp){
            if (ele!==socket.id){
                temproomname = ele;
                break;
            }
        }
        clients = io.sockets.adapter.rooms.get(temproomname); 
        // console.log(tempname,temproomname,clients);
        // console.log(clients);
        let size=0;
        if (clients!==undefined) size = clients.size;
        if (size>=4){
            let winnername='';let hisscore=-1;
            clients = io.sockets.adapter.rooms.get(temproomname); 
            let leftname = socket.data.name;
            for (let ele of clients){
                var tempsocket = io.sockets.sockets.get(ele);
                if (tempsocket.data.name!==leftname && tempsocket.data.score>hisscore){
                    hisscore = tempsocket.data.score;
                    winnername = tempsocket.data.name;
                }
            }
            
            socket.to(temproomname).emit('someleftvetween',{winnername,hisscore,leftname});
            for (let ele of clients){
                var tempsocket = io.sockets.sockets.get(ele);
                tempsocket.leave(temproomname);
            }
            // someone left in between show the result page
        }
        else{
            socket.to(temproomname).emit('someoneleft',{tempname});
        }
    })
    socket.on('roundsend',(roomname)=>{
        let winnername='';let hisscore=-1;
        clients = io.sockets.adapter.rooms.get(roomname); 
        for (let ele of clients){
            var tempsocket = io.sockets.sockets.get(ele);
            if (tempsocket.data.score>hisscore){
                hisscore = tempsocket.data.score;
                winnername = tempsocket.data.name;
            }
        }
        io.to(roomname).emit('showresult',{winnername,hisscore});
    })
})



app.get('/',(req,res)=>{
    res.send('server is up and running');
})
server.listen(PORT,()=>{
    console.log(`listening to port ${PORT}`);
})
