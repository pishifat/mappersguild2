import{B as s}from"./beatmap.8dd9b4cb.js";import{d as a,i as e,k as t,o,b as l,F as r,g as i,q as n,f as c,n as d,t as u,j as p,l as f}from"./vendor.df51a6ea.js";var m=a({props:{associatedMaps:{type:Array,required:!0}},methods:{findIcon:a=>a==s.WIP?"fa-ellipsis-h":a==s.Done?"fa-check":a==s.Qualified||a==s.Ranked?"fa-check-circle":""}});const k={class:"card card-body container"},y=c("h5",null," Associated maps ",-1),h={key:0,class:"ps-3 mb-0 list-unstyled"},b=["href"],g={key:1},v=f(" by "),x={key:1,class:"small text-white-50 ms-3"};m.render=function(s,a,f,m,j,I){const M=e("user-link"),q=t("bs-tooltip");return o(),l("div",k,[y,s.associatedMaps.length?(o(),l("ul",h,[(o(!0),l(r,null,i(s.associatedMaps,(a=>(o(),l("li",{key:a.id,class:"text-secondary"},[n(c("i",{class:d(["fas me-1",[`text-${a.status.toLowerCase()}`,s.findIcon(a.status)]])},null,2),[[q,a.status]]),a.url?(o(),l("a",{key:0,href:a.url,target:"_blank"},u(a.song.artist)+" - "+u(a.song.title),9,b)):(o(),l("span",g,u(a.song.artist)+" - "+u(a.song.title),1)),v,p(M,{user:a.host},null,8,["user"])])))),128))])):(o(),l("div",x," No associated maps... "))])};export{m as _};
