import{U as q}from"./UserInfo-b208149b.js";import{D as B}from"./DataTable-daaff149.js";import{d as $,m as C,_ as y,o as t,e as r,a,j as f,t as k,y as L,k as p,i,w as m,b as I,n as w,p as h,q as E,F as g,r as _,s as G,u as N,f as D,g as V}from"./index-f6a29143.js";import{C as S}from"./CopyPaste-e7e15399.js";import{A as F}from"./AddRestrictedUser-b7a75f6d.js";import"./ModalDialog-9fe41bd6.js";const P=$({components:{DataTable:B,UserInfo:q},props:{groupedUsers:{type:Array,default:()=>[]},group:{type:String,required:!0}},data(){return{selectedUserId:""}},computed:{...C({users:s=>s.usersAdmin.users}),selectedUser(){return this.users.find(s=>s.id===this.selectedUserId)}}}),T=["href"],K=a("i",{class:"fas fa-angle-down"},null,-1),O={key:0};function R(s,e,n,c,U,b){const u=h("user-link"),o=h("data-table"),l=h("user-info"),v=E("bs-tooltip");return t(),r("div",null,[a("a",{href:`#${s.group}`,"data-bs-toggle":"collapse",class:"ms-1",onClick:e[0]||(e[0]=L(()=>{},["prevent"]))},[a("h5",null,[f(k(s.group)+" ",1),K])],8,T),s.groupedUsers.length?p("",!0):(t(),r("div",O," (still loading) ")),i(o,{id:s.group,class:"collapse",data:s.groupedUsers,headers:["USERNAME","RANK","QUEUED BADGE","BADGE"],"custom-data-target":`#editUser${s.group}`,"onUpdate:selectedId":e[1]||(e[1]=d=>s.selectedUserId=d)},{default:m(({obj:d})=>[a("td",null,[i(u,{user:d},null,8,["user"])]),a("td",null,[d.rank?I((t(),r("i",{key:0,class:w(["fas fa-crown","text-rank-"+d.rank])},null,2)),[[v,`rank ${d.rank} user`]]):p("",!0)]),a("td",{class:w({"bg-open":d.rank!=d.queuedBadge})},[d.queuedBadge?I((t(),r("i",{key:0,class:w(["fas fa-crown","text-rank-"+d.queuedBadge])},null,2)),[[v,`rank ${d.queuedBadge} user`]]):p("",!0)],2),a("td",{class:w({"bg-open":d.rank!=d.badge})},[d.badge?I((t(),r("i",{key:0,class:w(["fas fa-crown","text-rank-"+d.badge])},null,2)),[[v,`rank ${d.badge} user`]]):p("",!0)],2)]),_:1},8,["id","data","custom-data-target"]),i(l,{user:s.selectedUser,"current-group":s.group},null,8,["user","current-group"])])}const j=y(P,[["render",R]]),z=$({name:"ShowcaseUserList",components:{CopyPaste:S},data(){return{osuUsers:[],taikoUsers:[],catchUsers:[],maniaUsers:[]}},computed:{uniqueUsers(){const s=this.osuUsers.concat(this.taikoUsers,this.catchUsers,this.maniaUsers),e=[];for(const n of s)e.find(U=>U.osuId==n.osuId)||e.push(n);return e},messages(){const s=[];return s.push(`hello! you're receiving this message because you marked yourself as a "FA showcase mapper" in the mappers guild https://osu.ppy.sh/home/news/2022-07-25-mappers-guild-updates#how-to-participate`),s.push("if you'd like to map an upcoming featured artist song for an announcement in October-December, send me some of the genres you'd like to map!"),s.push("i'll link some upcoming artists in return"),s.push("thank you!! -pishifat"),s}},methods:{async findShowcaseUsers(s){const e=await this.$http.executeGet("/admin/users/findShowcaseUsers",s);e&&!e.error&&(this.osuUsers=e.osuUsers,this.taikoUsers=e.taikoUsers,this.catchUsers=e.catchUsers,this.maniaUsers=e.maniaUsers)}}});const J=s=>(G("data-v-902d16a2"),s=s(),N(),s),Q={class:"container card card-body py-1"},W=J(()=>a("h5",{class:"mt-2"}," FA showcase users by mode ",-1)),X={key:0,class:"row"},Y={key:0,class:"col-sm-3"},Z={key:1,class:"col-sm-3"},x={key:2,class:"col-sm-3"},ss={key:3,class:"col-sm-3"};function es(s,e,n,c,U,b){const u=h("user-link"),o=h("copy-paste");return t(),r("div",Q,[W,a("button",{class:"btn btn-sm w-100 btn-outline-info mb-3",onClick:e[0]||(e[0]=l=>s.findShowcaseUsers(l))}," Load users "),s.osuUsers.length&&s.taikoUsers.length&&s.catchUsers.length&&s.maniaUsers.length?(t(),r("div",X,[s.osuUsers.length?(t(),r("div",Y,[f(" osu! "),i(o,{distinct:"osu"},{default:m(()=>[(t(!0),r(g,null,_(s.osuUsers,l=>(t(),r("div",{key:l.id},[i(u,{user:l},null,8,["user"])]))),128))]),_:1})])):p("",!0),s.taikoUsers.length?(t(),r("div",Z,[f(" osu!taiko "),i(o,{distinct:"taiko"},{default:m(()=>[(t(!0),r(g,null,_(s.taikoUsers,l=>(t(),r("div",{key:l.id},[i(u,{user:l},null,8,["user"])]))),128))]),_:1})])):p("",!0),s.catchUsers.length?(t(),r("div",x,[f(" osu!catch "),i(o,{distinct:"catch"},{default:m(()=>[(t(!0),r(g,null,_(s.catchUsers,l=>(t(),r("div",{key:l.id},[i(u,{user:l},null,8,["user"])]))),128))]),_:1})])):p("",!0),s.maniaUsers.length?(t(),r("div",ss,[f(" osu!mania "),i(o,{distinct:"mania"},{default:m(()=>[(t(!0),r(g,null,_(s.maniaUsers,l=>(t(),r("div",{key:l.id},[i(u,{user:l},null,8,["user"])]))),128))]),_:1})])):p("",!0)])):p("",!0)])}const ts=y(z,[["render",es],["__scopeId","data-v-902d16a2"]]),rs=$({name:"ShowcaseUserList",components:{CopyPaste:S},data(){return{osuUsers:[],taikoUsers:[],catchUsers:[],maniaUsers:[]}},computed:{uniqueUsers(){const s=this.osuUsers.concat(this.taikoUsers,this.catchUsers,this.maniaUsers),e=[];for(const n of s)e.find(U=>U.osuId==n.osuId)||e.push(n);return e},messages(){const s=[];return s.push(`hello! you're receiving this message because you marked yourself as a "FA showcase mapper" in the mappers guild https://i.imgur.com/aJt9uL1.png`),s.push("if you'd like to map an upcoming featured artist for an announcement in October-December, send me some of the genres you'd like to map!"),s.push("thank you!! -pishifat"),s}},methods:{async findContestHelperUsers(s){const e=await this.$http.executeGet("/admin/users/findContestHelperUsers",s);e&&!e.error&&(this.osuUsers=e.osuUsers,this.taikoUsers=e.taikoUsers,this.catchUsers=e.catchUsers,this.maniaUsers=e.maniaUsers)}}}),os={class:"container card card-body py-1"},ns=a("h5",{class:"mt-2"}," Contest helper users by mode ",-1),is={key:0,class:"row"},as={key:0,class:"col-sm-3"},us={key:1,class:"col-sm-3"},ds={key:2,class:"col-sm-3"},cs={key:3,class:"col-sm-3"};function ls(s,e,n,c,U,b){const u=h("copy-paste");return t(),r("div",os,[ns,a("button",{class:"btn btn-sm w-100 btn-outline-info mb-3",onClick:e[0]||(e[0]=o=>s.findContestHelperUsers(o))}," Load users "),s.osuUsers&&s.taikoUsers&&s.catchUsers&&s.maniaUsers?(t(),r("div",is,[s.osuUsers.length?(t(),r("div",as,[f(" osu! "),i(u,{distinct:"osu"},{default:m(()=>[(t(!0),r(g,null,_(s.osuUsers,o=>(t(),r("div",{key:o.id},k(o.username),1))),128))]),_:1})])):p("",!0),s.taikoUsers.length?(t(),r("div",us,[f(" osu!taiko "),i(u,{distinct:"taiko"},{default:m(()=>[(t(!0),r(g,null,_(s.taikoUsers,o=>(t(),r("div",{key:o.id},k(o.username),1))),128))]),_:1})])):p("",!0),s.catchUsers.length?(t(),r("div",ds,[f(" osu!catch "),i(u,{distinct:"catch"},{default:m(()=>[(t(!0),r(g,null,_(s.catchUsers,o=>(t(),r("div",{key:o.id},k(o.username),1))),128))]),_:1})])):p("",!0),s.maniaUsers.length?(t(),r("div",cs,[f(" osu!mania "),i(u,{distinct:"mania"},{default:m(()=>[(t(!0),r(g,null,_(s.maniaUsers,o=>(t(),r("div",{key:o.id},k(o.username),1))),128))]),_:1})])):p("",!0)])):p("",!0)])}const ps=y(rs,[["render",ls]]),hs=$({name:"DiscordHighlightGenerator",components:{CopyPaste:S},data(){return{inputUsers:"",users:[]}},computed:{discordHighlights(){let s="";for(const e of this.users)s+=`<@${e.discordId}> `;return s}},methods:{async generateDiscordHighlights(s){const e=await this.$http.executePost("/admin/users/findInputUsers",{inputUsers:this.inputUsers},s);e&&!e.error&&(this.users=e.users)}}}),ms={class:"container card card-body py-1"},fs=a("h5",{class:"mt-2"}," Generate Discord highlights ",-1),Us={key:0};function gs(s,e,n,c,U,b){const u=h("copy-paste");return t(),r("div",ms,[fs,I(a("textarea",{"onUpdate:modelValue":e[0]||(e[0]=o=>s.inputUsers=o),class:"form-control form-control-sm mx-2 mb-2 w-100",type:"text",autocomplete:"off",placeholder:"usernames separated by newlines..."},null,512),[[D,s.inputUsers]]),a("button",{class:"btn btn-sm w-100 btn-outline-info mb-2",onClick:e[1]||(e[1]=o=>s.generateDiscordHighlights(o))}," Generate Discord highlights "),s.users.length?(t(),r("div",Us,[i(u,null,{default:m(()=>[f(k(s.discordHighlights),1)]),_:1})])):p("",!0)])}const _s=y(hs,[["render",gs]]),ks=$({name:"DiscordHighlightGenerator",components:{CopyPaste:S},data(){return{osuId:null,output:null}},methods:{async searchUser(s){const e=await this.$http.executePost("/admin/users/searchUser",{osuId:this.osuId},s);e&&!e.error&&(this.output=e)}}}),$s={class:"container card card-body py-1"},ys=a("h5",{class:"mt-2"}," Search user in osu! API ",-1),bs={key:0};function vs(s,e,n,c,U,b){const u=h("copy-paste");return t(),r("div",$s,[ys,I(a("input",{"onUpdate:modelValue":e[0]||(e[0]=o=>s.osuId=o),class:"form-control form-control-sm mb-2",type:"text",maxlength:"18",autocomplete:"off",placeholder:"enter to search...",onKeyup:e[1]||(e[1]=V(o=>s.searchUser(o),["enter"]))},null,544),[[D,s.osuId]]),a("button",{class:"btn btn-sm w-100 btn-outline-info mb-2",onClick:e[2]||(e[2]=o=>s.searchUser(o))}," Load user "),s.output?(t(),r("div",bs,[i(u,null,{default:m(()=>[a("pre",null,k(s.output),1)]),_:1})])):p("",!0)])}const ws=y(ks,[["render",vs]]);var A=(s=>(s.User="user",s.Admin="admin",s.Secret="secret",s))(A||{});const Is={state:{users:[]},mutations:{setUsers(s,e){s.users=e},updateBadge(s,e){const n=s.users.find(c=>c.id==e.userId);n&&(n.queuedBadge=e.badge)},updateDiscordId(s,e){const n=s.users.find(c=>c.id==e.userId);n&&(n.discordId=e.discordId)},updateIsShowcaseMapper(s,e){const n=s.users.find(c=>c.id==e.userId);n&&(n.isShowcaseMapper=e.isShowcaseMapper)},updateIsMentorshipAdmin(s,e){const n=s.users.find(c=>c.id==e.userId);n&&(n.isMentorshipAdmin=e.isMentorshipAdmin)},updateHasMerchAccess(s,e){const n=s.users.find(c=>c.id==e.userId);n&&(n.hasMerchAccess=e.hasMerchAccess)}}},As=Is,Ss=$({components:{AdminUserTable:j,ShowcaseUserList:ts,ContestHelperUserList:ps,DiscordHighlightGenerator:_s,OsuApiUserSearch:ws,AddRestrictedUser:F},data(){return{selectedUserId:""}},computed:{...C({users:s=>s.usersAdmin.users}),selectedUser(){return this.users.find(s=>s.id===this.selectedUserId)},normalUsers(){return this.users.filter(s=>s.group==A.User)},showcaseUsers(){return this.users.filter(s=>s.group==A.Secret)},admins(){return this.users.filter(s=>s.group==A.Admin)}},beforeCreate(){this.$store.hasModule("usersAdmin")||this.$store.registerModule("usersAdmin",As)},unmounted(){this.$store.hasModule("usersAdmin")&&this.$store.unregisterModule("usersAdmin")},methods:{async loadUsers(s){const e=await this.$http.executeGet("/admin/users/load",s);this.$http.isError(e)||this.$store.commit("setUsers",e)}}}),Cs={class:"container card card-body"},Ds=a("h4",null," All users by group ",-1),Ms={key:0},Hs=a("hr",null,null,-1),qs=a("hr",null,null,-1);function Bs(s,e,n,c,U,b){const u=h("admin-user-table"),o=h("osu-api-user-search"),l=h("add-restricted-user"),v=h("showcase-user-list"),d=h("contest-helper-user-list"),M=h("discord-highlight-generator");return t(),r("div",null,[a("div",Cs,[Ds,a("button",{class:"btn btn-sm w-100 btn-outline-info",onClick:e[0]||(e[0]=H=>s.loadUsers(H))}," Load users "),s.users.length?(t(),r("div",Ms,[i(u,{"grouped-users":s.admins,group:"admin"},null,8,["grouped-users"]),i(u,{"grouped-users":s.showcaseUsers,group:"secret"},null,8,["grouped-users"]),i(u,{"grouped-users":s.normalUsers,group:"user"},null,8,["grouped-users"])])):p("",!0)]),Hs,i(o,{class:"mb-2"}),i(l,{class:"mb-2"}),qs,i(v,{class:"mb-2"}),i(d,{class:"mb-2"}),i(M,{class:"mb-2"})])}const Ps=y(Ss,[["render",Bs]]);export{Ps as default};