import{d as a,o as l,b as s,f as e,n as d,r as o,k as t,t as r,e as i}from"./vendor.cb33bf1d.js";var n=a({name:"ModalDialog",props:{title:{type:String,default:""},modalSize:{type:String,default:"lg"},headerClass:{type:String,default:"bg-primary"},loaded:{type:Boolean,default:!0}}});const m={class:"modal fade",tabindex:"-1"},c={key:0,class:"modal-content the-a-background"},f={class:"modal-title"},b=e("button",{type:"button",class:"btn-close","data-bs-dismiss":"modal"},null,-1),u={class:"modal-body"},p={key:0,class:"modal-footer"};n.render=function(a,n,g,y,v,h){return l(),s("div",m,[e("div",{class:d(["modal-dialog modal-fullscreen-lg-down",`modal-${a.modalSize}`])},[a.loaded?(l(),s("div",c,[e("div",{class:d(["modal-header",a.headerClass||"bg-primary"])},[e("h5",f,[o(a.$slots,"header",{},(()=>[t(r(a.title),1)]))]),b],2),e("div",u,[o(a.$slots,"default")]),a.$slots.footer?(l(),s("div",p,[o(a.$slots,"footer")])):i("",!0)])):i("",!0)],2)])};export{n as _};
