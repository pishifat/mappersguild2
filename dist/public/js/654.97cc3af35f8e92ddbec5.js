(self.webpackChunkmappersguild=self.webpackChunkmappersguild||[]).push([[654],{285:(e,t,s)=>{"use strict";s.d(t,{Z:()=>a});var o=s(5393);const a={name:"CopyPaste",props:{distinct:{type:String,default:""}},methods:{copy(){const e=document.querySelector(`#copyText${this.distinct}`);e.classList.add("animate-flicker"),this.$store.dispatch("updateToastMessages",{message:"Copied",type:"info"}),setTimeout((()=>{e.classList.remove("animate-flicker")}),500);const t=e.innerHTML.replace(/<br>/gi,"\r\n"),s=document.createElement("div");s.innerHTML=t,navigator.clipboard.writeText(s.textContent.trim())}},render:function(e,t,s,a,r,n){return(0,o.openBlock)(),(0,o.createBlock)("div",{id:"copyText"+s.distinct,class:"copy-text small text-white-50 font-monospace",onClick:t[1]||(t[1]=(...e)=>n.copy&&n.copy(...e))},[(0,o.renderSlot)(e.$slots,"default")],8,["id"])}}},1516:(e,t,s)=>{"use strict";s.d(t,{Z:()=>u});var o=s(5393);const a={class:"modal fade",tabindex:"-1"},r={key:0,class:"modal-content the-a-background"},n={class:"modal-title"},i=(0,o.createVNode)("button",{type:"button",class:"btn-close","data-bs-dismiss":"modal"},null,-1),c={class:"modal-body"},d={key:0,class:"modal-footer"},l=(0,o.defineComponent)({name:"ModalDialog",props:{title:{type:String,default:""},modalSize:{type:String,default:"lg"},headerClass:{type:String,default:"bg-primary"},loaded:{type:Boolean,default:!0}}});l.render=function(e,t,s,l,u,p){return(0,o.openBlock)(),(0,o.createBlock)("div",a,[(0,o.createVNode)("div",{class:["modal-dialog modal-fullscreen-lg-down",`modal-${e.modalSize}`]},[e.loaded?((0,o.openBlock)(),(0,o.createBlock)("div",r,[(0,o.createVNode)("div",{class:["modal-header",e.headerClass||"bg-primary"]},[(0,o.createVNode)("h5",n,[(0,o.renderSlot)(e.$slots,"header",{},(()=>[(0,o.createTextVNode)((0,o.toDisplayString)(e.title),1)]))]),i],2),(0,o.createVNode)("div",c,[(0,o.renderSlot)(e.$slots,"default")]),e.$slots.footer?((0,o.openBlock)(),(0,o.createBlock)("div",d,[(0,o.renderSlot)(e.$slots,"footer")])):(0,o.createCommentVNode)("",!0)])):(0,o.createCommentVNode)("",!0)],2)])};const u=l},1430:(e,t,s)=>{"use strict";s.d(t,{Z:()=>r});var o=s(5393);const a={class:"card card-body message-text small mb-2"},r={name:"BotChatMessage",props:{messages:{type:Array,default:()=>[],required:!0},messageType:{type:String,required:!0},mongoId:{type:String,required:!0},users:{type:Array,default:()=>[]}},methods:{async sendMessages(e){if(confirm("Are you sure?")){let t="";switch(this.messageType){case"contest":t=`/admin/contests/${this.mongoId}/sendMessages`;break;case"showcase":t="/admin/users/sendMessages";break;default:return""}await this.$http.executePost(t,{users:this.users,messages:this.messages},e)}}},render:function(e,t,s,r,n,i){return(0,o.openBlock)(),(0,o.createBlock)("div",null,[(0,o.createVNode)("div",a,[((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(s.messages,((e,t)=>((0,o.openBlock)(),(0,o.createBlock)("span",{key:t},(0,o.toDisplayString)(e),1)))),128))]),s.users.length?((0,o.openBlock)(),(0,o.createBlock)("a",{key:0,class:"btn btn-sm w-100 btn-success mb-2",onClick:t[1]||(t[1]=e=>i.sendMessages(e))}," Send messages ")):(0,o.createCommentVNode)("",!0)])}}},9352:(e,t,s)=>{"use strict";s.d(t,{Z:()=>c});var o=s(5393);const a={key:0,class:"table table-sm"},r=(0,o.createVNode)("th",null,"EDIT",-1),n={key:1,class:"text-white-50"},i=(0,o.defineComponent)({name:"DataTable",props:{data:{type:Array,required:!0},headers:{type:Array,required:!0},isLoading:Boolean,customDataTarget:{type:String,default:null}},emits:["update:selectedId"]});i.render=function(e,t,s,i,c,d){return(0,o.openBlock)(),(0,o.createBlock)("div",null,[e.data.length?((0,o.openBlock)(),(0,o.createBlock)("table",a,[(0,o.createVNode)("thead",null,[(0,o.createVNode)("tr",null,[((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.headers,(e=>((0,o.openBlock)(),(0,o.createBlock)("th",{key:e},(0,o.toDisplayString)(e),1)))),128)),r])]),(0,o.createVNode)("tbody",null,[((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.data,(t=>((0,o.openBlock)(),(0,o.createBlock)("tr",{key:t.id,class:"text-white-50"},[(0,o.renderSlot)(e.$slots,"default",{obj:t}),(0,o.createVNode)("td",null,[(0,o.createVNode)("a",{href:"#","data-bs-toggle":"modal","data-bs-target":e.customDataTarget||"#edit",onClick:(0,o.withModifiers)((s=>e.$emit("update:selectedId",t.id)),["prevent"])}," edit ",8,["data-bs-target","onClick"])])])))),128))])])):e.isLoading?(0,o.createCommentVNode)("",!0):((0,o.openBlock)(),(0,o.createBlock)("span",n,"None..."))])};const c=i},7182:(e,t,s)=>{"use strict";s.d(t,{Z:()=>g});var o=s(5393);const a={class:"container"},r={class:"row"},n=(0,o.createVNode)("option",{value:"user"}," User ",-1),i=(0,o.createVNode)("option",{value:"admin"}," Admin ",-1),c=(0,o.createVNode)("option",{value:"secret"}," Secret ",-1),d=(0,o.createVNode)("option",{value:"spectator"}," Spectator ",-1),l={class:"row"},u={class:"row"};var p=s(1516),m=function(e,t,s,o){return new(s||(s=Promise))((function(a,r){function n(e){try{c(o.next(e))}catch(e){r(e)}}function i(e){try{c(o.throw(e))}catch(e){r(e)}}function c(e){var t;e.done?a(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(n,i)}c((o=o.apply(e,t||[])).next())}))};const h=(0,o.defineComponent)({name:"UserInfo",components:{ModalDialog:p.Z},props:{user:{type:Object,default:null}},data:()=>({badge:0,discordId:"",group:""}),watch:{user(){this.badge=this.user.badge||0,this.discordId=this.user.discordId||"",this.group=this.user.group||""}},created(){this.user&&(this.badge=this.user.badge||0,this.discordId=this.user.discordId||"",this.group=this.user.group||"")},methods:{updateGroup(e){return m(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/users/${this.user.id}/updateGroup`,{group:this.group},e);t&&(this.$store.dispatch("updateToastMessages",{message:`set group to ${t}`,type:"info"}),this.$store.commit("updateGroup",{userId:this.user.id,group:t}))}))},updateBadge(e){return m(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/users/${this.user.id}/updateBadge`,{badge:this.badge},e);t&&(this.$store.dispatch("updateToastMessages",{message:`set queued badge to ${t}`,type:"info"}),this.$store.commit("updateBadge",{userId:this.user.id,badge:t}))}))},updateDiscordId(e){return m(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/users/${this.user.id}/updateDiscordId`,{discordId:this.discordId},e);t&&(this.$store.dispatch("updateToastMessages",{message:`set discord ID to ${t}`,type:"info"}),this.$store.commit("updateDiscordId",{userId:this.user.id,discordId:t}))}))},calculateUserPoints(e){return m(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/users/${this.user.id}/calculateUserPoints`,{},e);t&&this.$store.dispatch("updateToastMessages",{message:`calculated points: ${t}`,type:"info"})}))},toggleBypassLogin(e){return m(this,void 0,void 0,(function*(){const t=yield this.$http.executePost(`/admin/users/${this.user.id}/toggleBypassLogin`,{bypassLogin:!this.user.bypassLogin},e);t&&(this.$store.dispatch("updateToastMessages",{message:`set bypassLogin to ${t.bypassLogin}`,type:"info"}),this.$store.commit("updateBypassLogin",{userId:this.user.id,group:t.group,bypassLogin:t.bypassLogin}))}))}}});h.render=function(e,t,s,p,m,h){const g=(0,o.resolveComponent)("user-link"),k=(0,o.resolveComponent)("modal-dialog");return(0,o.openBlock)(),(0,o.createBlock)(k,{id:"editUser","header-class":e.user?"bg-rank-"+e.user.rank:"",loaded:Boolean(e.user)},{header:(0,o.withCtx)((()=>[(0,o.createVNode)(g,{user:e.user},null,8,["user"])])),default:(0,o.withCtx)((()=>[(0,o.createVNode)("div",a,[(0,o.createVNode)("p",r,[(0,o.withDirectives)((0,o.createVNode)("select",{"onUpdate:modelValue":t[1]||(t[1]=t=>e.group=t),class:"form-select form-select-sm w-50 mx-2"},[n,i,c,d],512),[[o.vModelSelect,e.group]]),(0,o.createVNode)("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[2]||(t[2]=t=>e.updateGroup(t))}," Save group ")]),(0,o.createVNode)("p",l,[(0,o.withDirectives)((0,o.createVNode)("input",{"onUpdate:modelValue":t[3]||(t[3]=t=>e.badge=t),class:"form-control form-control-sm mx-2 w-50",type:"text",autocomplete:"off"},null,512),[[o.vModelText,e.badge]]),(0,o.createVNode)("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[4]||(t[4]=t=>e.updateBadge(t))}," Queue badge ")]),(0,o.createVNode)("p",u,[(0,o.withDirectives)((0,o.createVNode)("input",{"onUpdate:modelValue":t[5]||(t[5]=t=>e.discordId=t),class:"form-control form-control-sm mx-2 w-50",type:"text",autocomplete:"off"},null,512),[[o.vModelText,e.discordId]]),(0,o.createVNode)("button",{class:"btn btn-sm btn-outline-info w-25",onClick:t[6]||(t[6]=t=>e.updateDiscordId(t))}," Save Discord ID ")]),(0,o.createVNode)("p",null,[(0,o.createVNode)("button",{class:"btn btn-sm btn-outline-info w-100",onClick:t[7]||(t[7]=t=>e.calculateUserPoints(t))}," Calculate user points ")]),(0,o.createVNode)("p",null,[(0,o.createVNode)("button",{class:"btn btn-sm btn-outline-info w-100",onClick:t[8]||(t[8]=t=>e.toggleBypassLogin(t))},(0,o.toDisplayString)(e.user.bypassLogin?"Enable":"Disable")+" ranked maps login requirement ",1)])])])),_:1},8,["header-class","loaded"])};const g=h},4921:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>L});var o=s(5393);const a={class:"container card card-body py-1"},r={class:"row"},n={class:"col-sm"},i={key:0,class:"ms-2 small text-white-50"};var c=s(7182),d=s(9352);const l={class:"container card card-body py-1 mb-4"},u={key:1,class:"row"},p={key:0,class:"col-sm-3"},m=(0,o.createTextVNode)(" osu! "),h={key:1,class:"col-sm-3"},g=(0,o.createTextVNode)(" osu!taiko "),k={key:2,class:"col-sm-3"},f=(0,o.createTextVNode)(" osu!catch "),y={key:3,class:"col-sm-3"},b=(0,o.createTextVNode)(" osu!mania ");var v=s(285),B=s(1430);const V=(0,o.defineComponent)({name:"ShowcaseUserList",components:{CopyPaste:v.Z,BotChatMessage:B.Z},data:()=>({osuUsers:[],taikoUsers:[],catchUsers:[],maniaUsers:[]}),computed:{uniqueUsers(){const e=this.osuUsers.concat(this.taikoUsers,this.catchUsers,this.maniaUsers),t=[];for(const s of e)t.find((e=>e.osuId==s.osuId))||t.push(s);return t},messages(){const e=[];return e.push("hello"),e.push("test"),e.push("goodbye"),e}},methods:{findShowcaseUsers(e){return t=this,s=void 0,a=function*(){const t=yield this.$http.executeGet("/admin/users/findShowcaseUsers",e);t&&!t.error&&(this.osuUsers=t.osuUsers,this.taikoUsers=t.taikoUsers,this.catchUsers=t.catchUsers,this.maniaUsers=t.maniaUsers)},new((o=void 0)||(o=Promise))((function(e,r){function n(e){try{c(a.next(e))}catch(e){r(e)}}function i(e){try{c(a.throw(e))}catch(e){r(e)}}function c(t){var s;t.done?e(t.value):(s=t.value,s instanceof o?s:new o((function(e){e(s)}))).then(n,i)}c((a=a.apply(t,s||[])).next())}));var t,s,o,a}}});V.render=function(e,t,s,a,r,n){const i=(0,o.resolveComponent)("bot-chat-message"),c=(0,o.resolveComponent)("copy-paste");return(0,o.openBlock)(),(0,o.createBlock)("div",l,[(0,o.createVNode)("button",{class:"btn btn-sm w-100 btn-outline-info mb-3",onClick:t[1]||(t[1]=t=>e.findShowcaseUsers(t))}," Load FA showcase users "),e.uniqueUsers.length?((0,o.openBlock)(),(0,o.createBlock)(i,{key:0,messages:e.messages,"message-type":"showcase","mongo-id":"",users:e.uniqueUsers},null,8,["messages","users"])):(0,o.createCommentVNode)("",!0),e.osuUsers.length&&e.taikoUsers.length&&e.catchUsers.length&&e.maniaUsers.length?((0,o.openBlock)(),(0,o.createBlock)("div",u,[e.osuUsers.length?((0,o.openBlock)(),(0,o.createBlock)("div",p,[m,(0,o.createVNode)(c,{distinct:"osu"},{default:(0,o.withCtx)((()=>[((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.osuUsers,(e=>((0,o.openBlock)(),(0,o.createBlock)("div",{key:e.id},(0,o.toDisplayString)(e.username),1)))),128))])),_:1})])):(0,o.createCommentVNode)("",!0),e.taikoUsers.length?((0,o.openBlock)(),(0,o.createBlock)("div",h,[g,(0,o.createVNode)(c,{distinct:"taiko"},{default:(0,o.withCtx)((()=>[((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.taikoUsers,(e=>((0,o.openBlock)(),(0,o.createBlock)("div",{key:e.id},(0,o.toDisplayString)(e.username),1)))),128))])),_:1})])):(0,o.createCommentVNode)("",!0),e.catchUsers.length?((0,o.openBlock)(),(0,o.createBlock)("div",k,[f,(0,o.createVNode)(c,{distinct:"catch"},{default:(0,o.withCtx)((()=>[((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.catchUsers,(e=>((0,o.openBlock)(),(0,o.createBlock)("div",{key:e.id},(0,o.toDisplayString)(e.username),1)))),128))])),_:1})])):(0,o.createCommentVNode)("",!0),e.maniaUsers.length?((0,o.openBlock)(),(0,o.createBlock)("div",y,[b,(0,o.createVNode)(c,{distinct:"mania"},{default:(0,o.withCtx)((()=>[((0,o.openBlock)(!0),(0,o.createBlock)(o.Fragment,null,(0,o.renderList)(e.maniaUsers,(e=>((0,o.openBlock)(),(0,o.createBlock)("div",{key:e.id},(0,o.toDisplayString)(e.username),1)))),128))])),_:1})])):(0,o.createCommentVNode)("",!0)])):(0,o.createCommentVNode)("",!0)])};const N=V,U={class:"container card card-body py-1 mb-4"},w={key:0};const C=(0,o.defineComponent)({name:"DiscordHighlightGenerator",components:{CopyPaste:v.Z},data:()=>({inputUsers:"",users:[]}),computed:{discordHighlights(){let e="";for(const t of this.users)e+=`<@${t.discordId}> `;return e}},methods:{generateDiscordHighlights(e){return t=this,s=void 0,a=function*(){const t=yield this.$http.executePost("/admin/users/findInputUsers",{inputUsers:this.inputUsers},e);t&&!t.error&&(this.users=t.users)},new((o=void 0)||(o=Promise))((function(e,r){function n(e){try{c(a.next(e))}catch(e){r(e)}}function i(e){try{c(a.throw(e))}catch(e){r(e)}}function c(t){var s;t.done?e(t.value):(s=t.value,s instanceof o?s:new o((function(e){e(s)}))).then(n,i)}c((a=a.apply(t,s||[])).next())}));var t,s,o,a}}});C.render=function(e,t,s,a,r,n){const i=(0,o.resolveComponent)("copy-paste");return(0,o.openBlock)(),(0,o.createBlock)("div",U,[(0,o.withDirectives)((0,o.createVNode)("textarea",{"onUpdate:modelValue":t[1]||(t[1]=t=>e.inputUsers=t),class:"form-control form-control-sm mx-2 mt-2 w-100",type:"text",autocomplete:"off",placeholder:"usernames separated by newlines..."},null,512),[[o.vModelText,e.inputUsers]]),(0,o.createVNode)("button",{class:"btn btn-sm w-100 btn-outline-info",onClick:t[2]||(t[2]=t=>e.generateDiscordHighlights(t))}," Generate Discord highlights "),e.users.length?((0,o.openBlock)(),(0,o.createBlock)("div",w,[(0,o.createVNode)(i,null,{default:(0,o.withCtx)((()=>[(0,o.createTextVNode)((0,o.toDisplayString)(e.discordHighlights),1)])),_:1})])):(0,o.createCommentVNode)("",!0)])};const x=C;var $=s(6564);const I={state:{users:[]},mutations:{setUsers(e,t){e.users=t},updateBadge(e,t){const s=e.users.find((e=>e.id==t.userId));s&&(s.queuedBadge=t.badge)},updateDiscordId(e,t){const s=e.users.find((e=>e.id==t.userId));s&&(s.discordId=t.discordId)},updateBypassLogin(e,t){const s=e.users.find((e=>e.id==t.userId));s&&(s.bypassLogin=t.bypassLogin)}}};var D=function(e,t,s,o){return new(s||(s=Promise))((function(a,r){function n(e){try{c(o.next(e))}catch(e){r(e)}}function i(e){try{c(o.throw(e))}catch(e){r(e)}}function c(e){var t;e.done?a(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(n,i)}c((o=o.apply(e,t||[])).next())}))};const S=(0,o.defineComponent)({components:{DataTable:d.Z,UserInfo:c.Z,ShowcaseUserList:N,DiscordHighlightGenerator:x},data:()=>({selectedUserId:"",calculatingPoints:!1}),computed:Object.assign(Object.assign({},(0,$.rn)({users:e=>e.usersAdmin.users})),{selectedUser(){return this.users.find((e=>e.id===this.selectedUserId))}}),beforeCreate(){this.$store.hasModule("usersAdmin")||this.$store.registerModule("usersAdmin",I)},unmounted(){this.$store.hasModule("usersAdmin")&&this.$store.unregisterModule("usersAdmin")},created(){return D(this,void 0,void 0,(function*(){const e=yield this.$http.initialRequest("/admin/users/load");this.$http.isError(e)||this.$store.commit("setUsers",e)}))},methods:{updateUser(e){const t=this.users.findIndex((t=>t.id==e.id));-1!==t&&(this.users[t]=e)},updateUserPoints(e){return D(this,void 0,void 0,(function*(){this.calculatingPoints=!0,(yield this.$http.executePost("/admin/users/updateAllUserPoints",{},e))&&(this.calculatingPoints=!1)}))}}});S.render=function(e,t,s,c,d,l){const u=(0,o.resolveComponent)("user-link"),p=(0,o.resolveComponent)("data-table"),m=(0,o.resolveComponent)("user-info"),h=(0,o.resolveComponent)("showcase-user-list"),g=(0,o.resolveComponent)("discord-highlight-generator"),k=(0,o.resolveDirective)("bs-tooltip");return(0,o.openBlock)(),(0,o.createBlock)("div",null,[(0,o.createVNode)("div",a,[(0,o.createVNode)("div",r,[(0,o.createVNode)("div",n,[(0,o.createVNode)("button",{class:"btn btn-sm btn-info w-100",onClick:t[1]||(t[1]=t=>e.updateUserPoints(t))}," Update user points "),e.calculatingPoints?((0,o.openBlock)(),(0,o.createBlock)("span",i,"calculating points...")):(0,o.createCommentVNode)("",!0),(0,o.createVNode)(p,{data:e.users,headers:["USERNAME","RANK","QUEUED BADGE","BADGE"],"custom-data-target":"#editUser","onUpdate:selectedId":t[2]||(t[2]=t=>e.selectedUserId=t)},{default:(0,o.withCtx)((({obj:e})=>[(0,o.createVNode)("td",null,[(0,o.createVNode)(u,{user:e},null,8,["user"])]),(0,o.createVNode)("td",null,[e.rank?(0,o.withDirectives)(((0,o.openBlock)(),(0,o.createBlock)("i",{key:0,class:["fas fa-crown","text-rank-"+e.rank]},null,2)),[[k,`rank ${e.rank} user`]]):(0,o.createCommentVNode)("",!0)]),(0,o.createVNode)("td",{class:{"bg-open":e.rank!=e.queuedBadge}},[e.queuedBadge?(0,o.withDirectives)(((0,o.openBlock)(),(0,o.createBlock)("i",{key:0,class:["fas fa-crown","text-rank-"+e.queuedBadge]},null,2)),[[k,`rank ${e.queuedBadge} user`]]):(0,o.createCommentVNode)("",!0)],2),(0,o.createVNode)("td",{class:{"bg-open":e.rank!=e.badge}},[e.badge?(0,o.withDirectives)(((0,o.openBlock)(),(0,o.createBlock)("i",{key:0,class:["fas fa-crown","text-rank-"+e.badge]},null,2)),[[k,`rank ${e.badge} user`]]):(0,o.createCommentVNode)("",!0)],2)])),_:1},8,["data"])])])]),(0,o.createVNode)(m,{user:e.selectedUser,onUpdateUser:t[3]||(t[3]=t=>e.updateUser(t))},null,8,["user"]),(0,o.createVNode)(h),(0,o.createVNode)(g)])};const L=S}}]);