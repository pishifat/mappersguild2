import{d as e,o as l,b as a,f as t,s as r,P as s,r as u}from"./vendor.8b5721c7.js";var o=e({props:{placeholder:{type:String,required:!0},filterValue:{type:String,default:""}},emits:["update:filterValue"],data:()=>({newFilterValue:""})});const i={class:"row mb-2"},n={class:"col"},p={class:"input-group"},c=[t("i",{class:"fas fa-search"},null,-1)],d=["placeholder","value"],f={class:"row small"},v={class:"col"};o.render=function(e,o,m,V,h,b){return l(),a("div",null,[t("div",i,[t("div",n,[t("div",p,[t("button",{class:"btn btn-primary",href:"#",onClick:o[0]||(o[0]=r((l=>e.$emit("update:filterValue",e.newFilterValue)),["prevent"]))},c),t("input",{class:"form-control",type:"text",maxlength:"48",placeholder:e.placeholder,autocomplete:"off",value:e.filterValue,onInput:o[1]||(o[1]=l=>e.newFilterValue=l.target.value),onKeyup:o[2]||(o[2]=s((l=>e.$emit("update:filterValue",l.target.value)),["enter"]))},null,40,d),u(e.$slots,"default")])])]),t("div",f,[t("div",v,[u(e.$slots,"filters")])])])};export{o as _};
