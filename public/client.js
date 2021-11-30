const socket = io();

let started = false;
let myscore=0;
const my_image = document.querySelector('.my_image');
const other_image =  document.querySelector('.other_image');
const table = document.querySelector('.table');
const myroomname = document.querySelector('.my_room_name')
let myimgsrc = '';
let clickable=true;
let rounds = 20;


const images = ['king.jpg','soldier.jpg','thief.jpg','wazir.jpg'];
const { name, roomname } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

myroomname.innerHTML = `Room: ${roomname}`;
socket.emit('new_user_joinded',{name,roomname});
socket.on('started',()=>{
    started=true;
})

socket.on('redirect',({msg})=>{
    alert(msg);
    window.location = 'index.html';
})
socket.on('my_score',()=>{
    const temprow = document.createElement('tr');
    temprow.id = name+'$%';
    temprow.innerHTML = `
        <td class="usernames">${name}</td><td class="userscores">:${myscore}</td>
    `;
    table.appendChild(temprow);
})
socket.on('other_score',(name)=>{
    const temprow = document.createElement('tr');
    temprow.id = name+'$%';
    temprow.innerHTML = `
        <td class="usernames">${name}</td><td class="userscores">:0</td>
    `;
    table.appendChild(temprow);
})
socket.on('showtome',({name,imgsrc})=>{
    if (imgsrc!=='img_avatar.jpg'){
        rounds = rounds-1;
        document.querySelector('.any_message').innerText = `
            Rounds Left : ${rounds}
        `;
    }
    const tempval = name+'$%';
    myimgsrc = imgsrc;
    if (myimgsrc==='king.jpg'){
        myscore = myscore+1000;
        socket.emit('iamking');
        document.getElementById(name+'$%').innerHTML=`
            <td class="usernames">${name}</td><td class="userscores">:${myscore}</td>
        `;
        socket.emit('updatescore',{name,myscore,roomname});
    }
    const tempdiv = document.createElement('div');
    tempdiv.classList.add('image_container');
    let innerText = `
        
        <img class="image" src='${imgsrc}' alt="img">
        <button  class="user_name">${name}</button>
        
    `;
    tempdiv.innerHTML = innerText;
    tempdiv.id=name;
    my_image.appendChild(tempdiv);
})
socket.on('clear_both_line',()=>{
    other_image.innerHTML="";
    my_image.innerHTML="";
})

socket.on('initialize',({tempname,tempimgsrc})=>{
    const tempdiv = document.createElement('div');
    tempdiv.classList.add('image_container');
    let innerText;
    if (myimgsrc==='wazir.jpg'){
        if (tempimgsrc==='king.jpg'){
            innerText = `
                <img class="image" id='king.jpg' src='king.jpg' alt="img">
                <button class="user_name">${tempname}</button>
            `;
        }
        else{
            if (tempimgsrc==='thief.jpg'){
                innerText = `
                    <img class="image" id='thief.jpg' src='img_avatar.jpg' alt="img">
                    <button onclick="onimgclick('${tempname}','${tempimgsrc}')" class="user_name">${tempname}</button>
                `;
            }
            else{
                innerText = `
                    <img class="image" id='soldier.jpg' src='img_avatar.jpg' alt="img">
                    <button onclick="onimgclick('${tempname}','${tempimgsrc}')" class="user_name">${tempname}</button>
                `;
            }
            
        }
    }
    else{
        innerText = `
            <img class="image" src='${tempimgsrc}' alt="img">
            <button class="user_name">${tempname}</button>
        `;
    }
    tempdiv.id=tempname;
    tempdiv.innerHTML = innerText;
    other_image.appendChild(tempdiv);
})

socket.on('user-joined',({name,imgsrc})=>{
    const tempdiv = document.createElement('div');
    tempdiv.classList.add('image_container');
    let innerText = `
                      
        <img class="image" src='${imgsrc}' alt="img">
        <button onclick="onimgclick('${name}','${imgsrc}')" class="user_name">${name}</button> 
    `;
    tempdiv.innerHTML=innerText;
    tempdiv.id=name;
    other_image.appendChild(tempdiv);
})
socket.on('updateotherscore',({name,myscore})=>{
    document.getElementById(name+'$%').innerHTML = `
        <td class="usernames">${name}</td><td class="userscores">:${myscore}</td>
    `;
})
socket.on('permission',()=>{
    document.getElementById('thief.jpg').src = "thief.jpg";
    document.getElementById('soldier.jpg').src = "soldier.jpg";
})

socket.on('showcolors',({color,tempname})=>{
    document.getElementById(tempname).style.borderColor=color;
})
socket.on('youarethief',()=>{
    myscore = myscore+800;
    document.getElementById(name+'$%').innerHTML = `
        <td class="usernames">${name}</td><td class="userscores">:${myscore}</td>
    `;
    socket.emit('returnedfromthief',{name,myscore,roomname});
})
// socket.on('updatethiefscore',(tempname)=>{
//     document.getElementById(tempname+'$%').innerHTML = `
//         <td class="usernames">${tempname}</td><td class="userscores">:${myscore}</td>
//     `;
// })
socket.on('thiefscore',({name,myscore})=>{
    document.getElementById(name+'$%').innerHTML = `
        <td class="usernames">${name}</td><td class="userscores">:${myscore}</td>
    `;
})
socket.on('youaresoldier',()=>{
    myscore = myscore+500;
    document.getElementById(name+'$%').innerHTML = `
        <td class="usernames">${name}</td><td class="userscores">:${myscore}</td>
    `;
    socket.emit('returnedfromsoldier',{name,myscore,roomname});
})
socket.on('updatesoldier',({name,myscore})=>{
    document.getElementById(name+'$%').innerHTML = `
        <td class="usernames">${name}</td><td class="userscores">:${myscore}</td>
    `;
})
socket.on('someonemsg',({name,data})=>{
    let tempspan = document.createElement('span');
    tempspan.classList.add('popuptext');
    tempspan.id = name+'@#';
    tempspan.innerText = data;
    document.getElementById(name).appendChild(tempspan);
    setTimeout(() => {
        document.getElementById(name+'@#').remove();
    }, 10000);
})
socket.on('someoneleft',({tempname})=>{
    document.getElementById(tempname).remove();
    document.getElementById(tempname+'$%').remove();
    // remove msg also
})
socket.on('showresult',({winnername,hisscore})=>{
    document.body.innerHTML = `
    <div class="resultdiv">
        <h1 class="winnerh1">Winner</h1>
        <h1 class="winnername">${winnername}<h1>
        <p class="winnerscore">${hisscore}</p><br>
        <button class="gobackbutton" onclick="goback()">Go Back</button>
    </div>
    `;
})
socket.on('someleftvetween',({winnername,hisscore,leftname})=>{
    document.body.innerHTML = `
        <div class="resultdiv">
            <h1 class="winnerh1">Winner</h1>
            <h1 class="winnername">${winnername}<h1>
            <p class="winnerscore">${hisscore}</p><br>
            <p class="leftperson">${leftname} left in between</p>
            <button class="gobackbutton" onclick="goback()">Go Back</button>
        </div>
    `;
})
socket.on('youleft',()=>{
    document.body.innerHTML = `
        <div class="resultdiv">
            <h1 class="ileft">You Left In between</h1>
            <button class="gobackbutton" onclick="goback()">Go Back</button>
        </div>
    `;
})
const sendmessage = () => {
    const ele = document.getElementById('message_input');
    const data = ele.value;
    // do with data
    let tempspan = document.createElement('span');
    tempspan.classList.add('popuptext');
    tempspan.id = name+'@#';
    tempspan.innerText = data;
    document.getElementById(name).appendChild(tempspan);
    socket.emit('showmsgtoall',{name,data,roomname});
    setTimeout(() => {
        document.getElementById(name+'@#').remove();
    }, 7000);
    ele.value = "";
}

const onimgclick=(tempname,srcimg) => {
    if (started && clickable){
        clickable=false;
        let color='red';
        if (srcimg==='thief.jpg'){
            document.getElementById(tempname).style.borderColor="green";
            color = 'green';
            myscore = myscore+800;
            socket.emit('iamwazir');
            document.getElementById(name+'$%').innerHTML=`
                <td class="usernames">${name}</td><td class="userscores">:${myscore}</td>
            `;
            socket.emit('updatescore',{name,myscore,roomname});
            
            socket.emit('selected',{color,tempname,roomname});
        }
        else{
            document.getElementById(tempname).style.borderColor="red";
            socket.emit('updatethiefscr',{roomname});
            socket.emit('selected',{color,tempname,roomname});
        }
        socket.emit('show_images');
        socket.emit('updatesoldierscr',{roomname});
        if (rounds===0){
            setTimeout(()=>socket.emit('roundsend',roomname),2000);
        }
        setTimeout(myfonction, 7000);
    }
}

const goback = () => {
    window.location = 'index.html';
}

const myfonction = () => {
    myimgsrc='';
    clickable = true;
    other_image.innerHTML="";
    my_image.innerHTML="";
    socket.emit('restart',roomname);
}