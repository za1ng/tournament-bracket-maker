const players=[

{
id:"p1",
name:"Joe",
image:"images/joe.jpg"
},

{
id:"p2",
name:"Gabe",
image:"images/gabe.jpg"
},

{
id:"p3",
name:"Delson",
image:"images/delson.jpg"
},

{
id:"p4",
name:"Zak",
image:"images/zak.jpg"
},

{
id:"p5",
name:"Zyad",
image:"images/zyad.jpg"
},

{
id:"p6",
name:"Charlie",
image:"images/charlie.jpg"
},

{
id:"p7",
name:"Nohib",
image:"images/nohib.jpg"
},

{
id:"p8",
name:"Mark",
image:"images/mark.jpg"
},

{
id:"p9",
name:"Tim",
image:"images/tim.jpg"
},

{
id:"p10",
name:"Zain",
image:"images/zain.jpg"
},

{
id:"p11",
name:"Ivan",
image:"images/ivan.jpg"
},

{
id:"p12",
name:"Sam",
image:"images/sam.jpg"
},

];



players.forEach(player=>{


let box=document.getElementById(player.id);


box.innerHTML=`

<div class="player">

<img src="${player.image}">

<span>${player.name}</span>

</div>

`;



box.onclick=function(){

box.classList.toggle("eliminated");

};


});
