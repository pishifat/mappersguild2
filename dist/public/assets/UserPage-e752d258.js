import{U as q}from"./UserInfo-3cf0ef92.js";import{D as B}from"./DataTable-d60f5f19.js";import{d as w,m as M,_ as v,o as t,e as r,a as i,j as f,t as k,y as E,i as a,w as m,b,n as y,k as p,p as h,q as G,F as g,r as _,s as V,u as N,f as D,g as H}from"./index-970ccb5e.js";import{C as S}from"./CopyPaste-20ad41c9.js";import{A as F}from"./AddRestrictedUser-68f8b404.js";import"./ModalDialog-390e660e.js";const P=w({components:{DataTable:B,UserInfo:q},props:{groupedUsers:{type:Array,default:()=>[]},group:{type:String,required:!0}},data(){return{selectedUserId:""}},computed:{...M({users:s=>s.usersAdmin.users}),selectedUser(){return this.users.find(s=>s.id===this.selectedUserId)}}}),K=["href"],T=i("i",{class:"fas fa-angle-down"},null,-1);function O(s,e,n,u,U,I){const d=h("user-link"),o=h("data-table"),l=h("user-info"),A=G("bs-tooltip");return t(),r("div",null,[i("a",{href:`#${s.group}`,"data-bs-toggle":"collapse",class:"ms-1",onClick:e[0]||(e[0]=E(()=>{},["prevent"]))},[i("h6",null,[f(k(s.group)+" ",1),T])],8,K),a(o,{id:s.group,class:y(s.groupedUsers.length>30?"collapse":"show"),data:s.groupedUsers,headers:["USERNAME","RANK","QUEUED BADGE","BADGE"],"custom-data-target":`#editUser${s.group}`,"onUpdate:selectedId":e[1]||(e[1]=c=>s.selectedUserId=c)},{default:m(({obj:c})=>[i("td",null,[a(d,{user:c},null,8,["user"])]),i("td",null,[c.rank?b((t(),r("i",{key:0,class:y(["fas fa-crown","text-rank-"+c.rank])},null,2)),[[A,`rank ${c.rank} user`]]):p("",!0)]),i("td",{class:y({"bg-open":c.rank!=c.queuedBadge})},[c.queuedBadge?b((t(),r("i",{key:0,class:y(["fas fa-crown","text-rank-"+c.queuedBadge])},null,2)),[[A,`rank ${c.queuedBadge} user`]]):p("",!0)],2),i("td",{class:y({"bg-open":c.rank!=c.badge})},[c.badge?b((t(),r("i",{key:0,class:y(["fas fa-crown","text-rank-"+c.badge])},null,2)),[[A,`rank ${c.badge} user`]]):p("",!0)],2)]),_:1},8,["id","class","data","custom-data-target"]),a(l,{user:s.selectedUser,"current-group":s.group},null,8,["user","current-group"])])}const R=v(P,[["render",O]]),W=w({name:"ShowcaseUserList",components:{CopyPaste:S},data(){return{osuUsers:[],taikoUsers:[],catchUsers:[],maniaUsers:[]}},computed:{uniqueUsers(){const s=this.osuUsers.concat(this.taikoUsers,this.catchUsers,this.maniaUsers),e=[];for(const n of s)e.find(U=>U.osuId==n.osuId)||e.push(n);return e},messages(){const s=[];return s.push(`hello! you're receiving this message because you marked yourself as a "FA showcase mapper" in the mappers guild https://osu.ppy.sh/home/news/2022-07-25-mappers-guild-updates#how-to-participate`),s.push("if you'd like to map an upcoming featured artist song for an announcement in October-December, send me some of the genres you'd like to map!"),s.push("i'll link some upcoming artists in return"),s.push("thank you!! -pishifat"),s}},methods:{async findShowcaseUsers(s){const e=await this.$http.executeGet("/admin/users/findShowcaseUsers",s);e&&!e.error&&(this.osuUsers=e.osuUsers,this.taikoUsers=e.taikoUsers,this.catchUsers=e.catchUsers,this.maniaUsers=e.maniaUsers)}}});const j=s=>(V("data-v-902d16a2"),s=s(),N(),s),z={class:"container card card-body py-1"},J=j(()=>i("h5",{class:"mt-2"}," FA showcase users by mode ",-1)),Q={key:0,class:"row"},X={key:0,class:"col-sm-3"},Y={key:1,class:"col-sm-3"},Z={key:2,class:"col-sm-3"},x={key:3,class:"col-sm-3"};function ss(s,e,n,u,U,I){const d=h("user-link"),o=h("copy-paste");return t(),r("div",z,[J,i("button",{class:"btn btn-sm w-100 btn-outline-info mb-3",onClick:e[0]||(e[0]=l=>s.findShowcaseUsers(l))}," Load users "),s.osuUsers.length&&s.taikoUsers.length&&s.catchUsers.length&&s.maniaUsers.length?(t(),r("div",Q,[s.osuUsers.length?(t(),r("div",X,[f(" osu! "),a(o,{distinct:"osu"},{default:m(()=>[(t(!0),r(g,null,_(s.osuUsers,l=>(t(),r("div",{key:l.id},[a(d,{user:l},null,8,["user"])]))),128))]),_:1})])):p("",!0),s.taikoUsers.length?(t(),r("div",Y,[f(" osu!taiko "),a(o,{distinct:"taiko"},{default:m(()=>[(t(!0),r(g,null,_(s.taikoUsers,l=>(t(),r("div",{key:l.id},[a(d,{user:l},null,8,["user"])]))),128))]),_:1})])):p("",!0),s.catchUsers.length?(t(),r("div",Z,[f(" osu!catch "),a(o,{distinct:"catch"},{default:m(()=>[(t(!0),r(g,null,_(s.catchUsers,l=>(t(),r("div",{key:l.id},[a(d,{user:l},null,8,["user"])]))),128))]),_:1})])):p("",!0),s.maniaUsers.length?(t(),r("div",x,[f(" osu!mania "),a(o,{distinct:"mania"},{default:m(()=>[(t(!0),r(g,null,_(s.maniaUsers,l=>(t(),r("div",{key:l.id},[a(d,{user:l},null,8,["user"])]))),128))]),_:1})])):p("",!0)])):p("",!0)])}const es=v(W,[["render",ss],["__scopeId","data-v-902d16a2"]]),ts=w({name:"ShowcaseUserList",components:{CopyPaste:S},data(){return{osuUsers:[],taikoUsers:[],catchUsers:[],maniaUsers:[]}},computed:{uniqueUsers(){const s=this.osuUsers.concat(this.taikoUsers,this.catchUsers,this.maniaUsers),e=[];for(const n of s)e.find(U=>U.osuId==n.osuId)||e.push(n);return e},messages(){const s=[];return s.push(`hello! you're receiving this message because you marked yourself as a "FA showcase mapper" in the mappers guild https://i.imgur.com/aJt9uL1.png`),s.push("if you'd like to map an upcoming featured artist for an announcement in October-December, send me some of the genres you'd like to map!"),s.push("thank you!! -pishifat"),s}},methods:{async findContestHelperUsers(s){const e=await this.$http.executeGet("/admin/users/findContestHelperUsers",s);e&&!e.error&&(this.osuUsers=e.osuUsers,this.taikoUsers=e.taikoUsers,this.catchUsers=e.catchUsers,this.maniaUsers=e.maniaUsers)}}}),rs={class:"container card card-body py-1"},os=i("h5",{class:"mt-2"}," Contest helper users by mode ",-1),ns={key:0,class:"row"},is={key:0,class:"col-sm-3"},as={key:1,class:"col-sm-3"},us={key:2,class:"col-sm-3"},ds={key:3,class:"col-sm-3"};function cs(s,e,n,u,U,I){const d=h("copy-paste");return t(),r("div",rs,[os,i("button",{class:"btn btn-sm w-100 btn-outline-info mb-3",onClick:e[0]||(e[0]=o=>s.findContestHelperUsers(o))}," Load users "),s.osuUsers&&s.taikoUsers&&s.catchUsers&&s.maniaUsers?(t(),r("div",ns,[s.osuUsers.length?(t(),r("div",is,[f(" osu! "),a(d,{distinct:"osu"},{default:m(()=>[(t(!0),r(g,null,_(s.osuUsers,o=>(t(),r("div",{key:o.id},k(o.username),1))),128))]),_:1})])):p("",!0),s.taikoUsers.length?(t(),r("div",as,[f(" osu!taiko "),a(d,{distinct:"taiko"},{default:m(()=>[(t(!0),r(g,null,_(s.taikoUsers,o=>(t(),r("div",{key:o.id},k(o.username),1))),128))]),_:1})])):p("",!0),s.catchUsers.length?(t(),r("div",us,[f(" osu!catch "),a(d,{distinct:"catch"},{default:m(()=>[(t(!0),r(g,null,_(s.catchUsers,o=>(t(),r("div",{key:o.id},k(o.username),1))),128))]),_:1})])):p("",!0),s.maniaUsers.length?(t(),r("div",ds,[f(" osu!mania "),a(d,{distinct:"mania"},{default:m(()=>[(t(!0),r(g,null,_(s.maniaUsers,o=>(t(),r("div",{key:o.id},k(o.username),1))),128))]),_:1})])):p("",!0)])):p("",!0)])}const ls=v(ts,[["render",cs]]),ps=w({name:"DiscordHighlightGenerator",components:{CopyPaste:S},data(){return{inputUsers:"",users:[]}},computed:{discordHighlights(){let s="";for(const e of this.users)s+=`<@${e.discordId}> `;return s}},methods:{async generateDiscordHighlights(s){const e=await this.$http.executePost("/admin/users/findInputUsers",{inputUsers:this.inputUsers},s);e&&!e.error&&(this.users=e.users)}}}),hs={class:"container card card-body py-1"},ms=i("h5",{class:"mt-2"}," Generate Discord highlights ",-1),fs={key:0};function Us(s,e,n,u,U,I){const d=h("copy-paste");return t(),r("div",hs,[ms,b(i("textarea",{"onUpdate:modelValue":e[0]||(e[0]=o=>s.inputUsers=o),class:"form-control form-control-sm mx-2 mb-2 w-100",type:"text",autocomplete:"off",placeholder:"usernames separated by newlines..."},null,512),[[D,s.inputUsers]]),i("button",{class:"btn btn-sm w-100 btn-outline-info mb-2",onClick:e[1]||(e[1]=o=>s.generateDiscordHighlights(o))}," Generate Discord highlights "),s.users.length?(t(),r("div",fs,[a(d,null,{default:m(()=>[f(k(s.discordHighlights),1)]),_:1})])):p("",!0)])}const gs=v(ps,[["render",Us]]),_s=w({name:"DiscordHighlightGenerator",components:{CopyPaste:S},data(){return{osuId:null,output:null}},methods:{async searchUser(s){const e=await this.$http.executePost("/admin/users/searchUser",{osuId:this.osuId},s);e&&!e.error&&(this.output=e)}}}),$s={class:"container card card-body py-1"},ks=i("h5",{class:"mt-2"}," Search user in osu! API ",-1),ys={key:0};function bs(s,e,n,u,U,I){const d=h("copy-paste");return t(),r("div",$s,[ks,b(i("input",{"onUpdate:modelValue":e[0]||(e[0]=o=>s.osuId=o),class:"form-control form-control-sm mb-2",type:"text",maxlength:"18",autocomplete:"off",placeholder:"enter to search...",onKeyup:e[1]||(e[1]=H(o=>s.searchUser(o),["enter"]))},null,544),[[D,s.osuId]]),i("button",{class:"btn btn-sm w-100 btn-outline-info mb-2",onClick:e[2]||(e[2]=o=>s.searchUser(o))}," Load user "),s.output?(t(),r("div",ys,[a(d,null,{default:m(()=>[i("pre",null,k(s.output),1)]),_:1})])):p("",!0)])}const ws=v(_s,[["render",bs]]);var C=(s=>(s.User="user",s.Admin="admin",s.Secret="secret",s))(C||{});const vs={state:{users:[]},mutations:{setUsers(s,e){s.users=e},updateBadge(s,e){const n=s.users.find(u=>u.id==e.userId);n&&(n.queuedBadge=e.badge)},updateDiscordId(s,e){const n=s.users.find(u=>u.id==e.userId);n&&(n.discordId=e.discordId)},updateIsShowcaseMapper(s,e){const n=s.users.find(u=>u.id==e.userId);n&&(n.isShowcaseMapper=e.isShowcaseMapper)},updateIsMentorshipAdmin(s,e){const n=s.users.find(u=>u.id==e.userId);n&&(n.isMentorshipAdmin=e.isMentorshipAdmin)},updateIsWorldCupHelper(s,e){const n=s.users.find(u=>u.id==e.userId);n&&(n.isWorldCupHelper=e.isWorldCupHelper)},updateHasMerchAccess(s,e){const n=s.users.find(u=>u.id==e.userId);n&&(n.hasMerchAccess=e.hasMerchAccess)}}},Is=vs,As=w({components:{AdminUserTable:R,ShowcaseUserList:es,ContestHelperUserList:ls,DiscordHighlightGenerator:gs,OsuApiUserSearch:ws,AddRestrictedUser:F},data(){return{selectedUserId:"",userInput:""}},computed:{...M({users:s=>s.usersAdmin.users}),selectedUser(){return this.users.find(s=>s.id===this.selectedUserId)},normalUsers(){return this.users.filter(s=>s.group==C.User)},showcaseUsers(){return this.users.filter(s=>s.group==C.Secret)},admins(){return this.users.filter(s=>s.group==C.Admin)}},beforeCreate(){this.$store.hasModule("usersAdmin")||this.$store.registerModule("usersAdmin",Is)},unmounted(){this.$store.hasModule("usersAdmin")&&this.$store.unregisterModule("usersAdmin")},methods:{async loadAllUsers(s){const e=await this.$http.executeGet("/admin/users/load",s);this.$http.isError(e)||this.$store.commit("setUsers",e)},async searchUser(s){const e=await this.$http.executeGet(`/admin/users/searchUser/${this.userInput}`,s);this.$http.isError(e)||this.$store.commit("setUsers",[e])}}}),Cs={class:"container card card-body"},Ss=i("h4",null," Load users ",-1),Ds=i("h5",{class:"mt-2"}," Single user ",-1),Ms=i("h5",{class:"mt-2"}," All users ",-1),Hs={key:0},Ls=i("hr",null,null,-1),qs=i("hr",null,null,-1);function Bs(s,e,n,u,U,I){const d=h("admin-user-table"),o=h("osu-api-user-search"),l=h("add-restricted-user"),A=h("showcase-user-list"),c=h("contest-helper-user-list"),L=h("discord-highlight-generator");return t(),r("div",null,[i("div",Cs,[Ss,Ds,b(i("input",{"onUpdate:modelValue":e[0]||(e[0]=$=>s.userInput=$),class:"form-control form-control-sm mb-2",type:"text",maxlength:"18",autocomplete:"off",placeholder:"enter to search...",onKeyup:e[1]||(e[1]=H($=>s.searchUser($),["enter"]))},null,544),[[D,s.userInput]]),i("button",{class:"btn btn-sm w-100 btn-outline-info mb-2",onClick:e[2]||(e[2]=$=>s.searchUser($))}," Load user "),Ms,i("button",{class:"btn btn-sm w-100 btn-outline-info",onClick:e[3]||(e[3]=$=>s.loadAllUsers($))}," Load all users "),s.users.length?(t(),r("div",Hs,[a(d,{"grouped-users":s.admins,group:"admin"},null,8,["grouped-users"]),a(d,{"grouped-users":s.showcaseUsers,group:"secret"},null,8,["grouped-users"]),a(d,{"grouped-users":s.normalUsers,group:"user"},null,8,["grouped-users"])])):p("",!0)]),Ls,a(o,{class:"mb-2"}),a(l,{class:"mb-2"}),qs,a(A,{class:"mb-2"}),a(c,{class:"mb-2"}),a(L,{class:"mb-2"})])}const Ks=v(As,[["render",Bs]]);export{Ks as default};
