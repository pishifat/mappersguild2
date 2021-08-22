import{_ as s}from"./ModalDialog.0d82a3c5.js";import{d as t,i as e,o,q as a,w as i,j as d,f as r,G as u,H as n,N as p,t as c}from"./vendor.cb33bf1d.js";var l=t({name:"UserInfo",components:{ModalDialog:s},props:{user:{type:Object,default:null}},data:()=>({badge:0,discordId:"",group:""}),watch:{user(){this.badge=this.user.badge||0,this.discordId=this.user.discordId||"",this.group=this.user.group||""}},created(){this.user&&(this.badge=this.user.badge||0,this.discordId=this.user.discordId||"",this.group=this.user.group||"")},methods:{async updateGroup(s){const t=await this.$http.executePost(`/admin/users/${this.user.id}/updateGroup`,{group:this.group},s);t&&(this.$store.dispatch("updateToastMessages",{message:`set group to ${t}`,type:"info"}),this.$store.commit("updateGroup",{userId:this.user.id,group:t}))},async updateBadge(s){const t=await this.$http.executePost(`/admin/users/${this.user.id}/updateBadge`,{badge:this.badge},s);t&&(this.$store.dispatch("updateToastMessages",{message:`set queued badge to ${t}`,type:"info"}),this.$store.commit("updateBadge",{userId:this.user.id,badge:t}))},async updateDiscordId(s){const t=await this.$http.executePost(`/admin/users/${this.user.id}/updateDiscordId`,{discordId:this.discordId},s);t&&(this.$store.dispatch("updateToastMessages",{message:`set discord ID to ${t}`,type:"info"}),this.$store.commit("updateDiscordId",{userId:this.user.id,discordId:t}))},async calculateUserPoints(s){const t=await this.$http.executePost(`/admin/users/${this.user.id}/calculateUserPoints`,{},s);t&&this.$store.dispatch("updateToastMessages",{message:`calculated points: ${t}`,type:"info"})},async toggleBypassLogin(s){const t=await this.$http.executePost(`/admin/users/${this.user.id}/toggleBypassLogin`,{bypassLogin:!this.user.bypassLogin},s);t&&(this.$store.dispatch("updateToastMessages",{message:`set bypassLogin to ${t.bypassLogin}`,type:"info"}),this.$store.commit("updateBypassLogin",{userId:this.user.id,group:t.group,bypassLogin:t.bypassLogin}))}}});const g={class:"container"},h={class:"row"},m=[r("option",{value:"user"}," User ",-1),r("option",{value:"admin"}," Admin ",-1),r("option",{value:"secret"}," Secret ",-1),r("option",{value:"spectator"}," Spectator ",-1)],b={class:"row"},f={class:"row"};l.render=function(s,t,l,y,$,I){const w=e("user-link"),x=e("modal-dialog");return o(),a(x,{id:"editUser","header-class":s.user?"bg-rank-"+s.user.rank:"",loaded:Boolean(s.user)},{header:i((()=>[d(w,{user:s.user},null,8,["user"])])),default:i((()=>[r("div",g,[r("p",h,[u(r("select",{"onUpdate:modelValue":t[0]||(t[0]=t=>s.group=t),class:"form-select form-select-sm w-50 mx-2"},m,512),[[n,s.group]]),r("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[1]||(t[1]=t=>s.updateGroup(t))}," Save group ")]),r("p",b,[u(r("input",{"onUpdate:modelValue":t[2]||(t[2]=t=>s.badge=t),class:"form-control form-control-sm mx-2 w-50",type:"text",autocomplete:"off"},null,512),[[p,s.badge]]),r("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[3]||(t[3]=t=>s.updateBadge(t))}," Queue badge ")]),r("p",f,[u(r("input",{"onUpdate:modelValue":t[4]||(t[4]=t=>s.discordId=t),class:"form-control form-control-sm mx-2 w-50",type:"text",autocomplete:"off"},null,512),[[p,s.discordId]]),r("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[5]||(t[5]=t=>s.updateDiscordId(t))}," Save Discord ID ")]),r("p",null,[r("button",{class:"btn btn-sm btn-outline-info w-100",onClick:t[6]||(t[6]=t=>s.calculateUserPoints(t))}," Calculate user points ")]),r("p",null,[r("button",{class:"btn btn-sm btn-outline-info w-100",onClick:t[7]||(t[7]=t=>s.toggleBypassLogin(t))},c(s.user.bypassLogin?"Enable":"Disable")+" ranked maps login requirement ",1)])])])),_:1},8,["header-class","loaded"])};export{l as _};
