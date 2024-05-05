import{d as M,m as C,_ as S,o,e as i,a as s,i as h,t as c,j as b,k as l,n as w,p as k,s as F,u as Q,b as v,V as G,q as I,z as T,F as g,r as U,c as p,M as R,W as A,w as q,x as E,y as N,T as O}from"./index-3a3c2d9b.js";import{M as L}from"./ModalDialog-ed80295d.js";import{T as H}from"./task-21eeb954.js";import{F as j}from"./FilterBox-6aa0dd6a.js";import{M as z,F as V}from"./extras-11f050c8.js";const J=M({name:"UserCard",props:{user:{type:Object,required:!0}},computed:C("users",["filterMode"]),methods:{selectUser(){this.$store.commit("users/setSelectedUserId",this.user.id)}}});const W=e=>(F("data-v-096980af"),e=e(),Q(),e),K=["src"],X={class:"mb-2"},Y={class:"text-secondary"},Z={class:"card-text small"},x={class:"card-text small"},ee=W(()=>s("i",{class:"fas fa-coins"},null,-1)),se={key:0,class:"card-text small"},te={key:1,class:"card-text small"},oe={key:2,class:"card-text small"},ie={key:3,class:"card-text small"};function re(e,t,n,a,y,P){const u=k("user-link");return o(),i("div",{class:"col-sm-6 col-md-4 col-lg-4 col-xl-3 my-2",onClick:t[0]||(t[0]=f=>e.selectUser())},[s("div",{class:w(["card card-hover card-level-2 card-body","border-rank-"+e.user.rank]),"data-bs-toggle":"modal","data-bs-target":"#extendedInfo"},[s("img",{src:"https://a.ppy.sh/"+e.user.osuId,class:"card-avatar-img"},null,8,K),s("div",X,[h(u,{user:e.user},null,8,["user"])]),s("div",Y,[s("div",Z,[s("b",null,"Total points: "+c(e.user.totalPoints),1)]),s("div",x,[b(" Available points: "+c(e.user.availablePoints)+" ",1),ee]),e.filterMode=="osu"?(o(),i("p",se," osu! points: "+c(Math.round(e.user.osuPoints*10)/10),1)):e.filterMode=="taiko"?(o(),i("p",te," osu!taiko points: "+c(Math.round(e.user.taikoPoints*10)/10),1)):e.filterMode=="catch"?(o(),i("p",oe," osu!catch points: "+c(Math.round(e.user.catchPoints*10)/10),1)):e.filterMode=="mania"?(o(),i("p",ie," osu!mania points: "+c(Math.round(e.user.maniaPoints*10)/10),1)):l("",!0)])],2)])}const ne=S(J,[["render",re],["__scopeId","data-v-096980af"]]),ae=M({name:"UserListElement",props:{user:{type:Object,required:!0}},computed:C("users",["filterMode"]),methods:{selectUser(){this.$store.commit("users/setSelectedUserId",this.user.id)},getCover(){var e;return this.user?this.user.cover?`url(${(e=this.user.cover)==null?void 0:e.url})`:`url(https://a.ppy.sh/${this.user.osuId})`:""}}});const le=e=>(F("data-v-80ba355e"),e=e(),Q(),e),de={class:"row"},ce={class:"col-sm-4"},ue=["src"],pe={class:"col-sm-4 text-secondary"},he={class:"card-text small"},me={class:"col-sm-4 text-secondary"},ge={key:0,class:"card-text small"},fe=le(()=>s("i",{class:"fas fa-coins"},null,-1)),ye={key:1,class:"card-text small"},_e={key:2,class:"card-text small"},be={key:3,class:"card-text small"},ke={key:4,class:"card-text small"};function $e(e,t,n,a,y,P){const u=k("user-link"),f=I("bs-tooltip");return o(),i("div",{class:w(["card card-body card-level-2 p-2","left-border-rank-"+e.user.rank]),style:G({background:`linear-gradient(90deg, #3c3b39 15%, rgba(0, 0, 0, 0.82) 140%), ${e.getCover()} center no-repeat`,backgroundSize:"cover"}),"data-bs-toggle":"modal","data-bs-target":"#extendedInfo",onClick:t[0]||(t[0]=d=>e.selectUser())},[s("div",de,[s("div",ce,[e.user.rank?v((o(),i("i",{key:0,class:w(["fas fa-crown mx-1 me-2","text-rank-"+e.user.rank])},null,2)),[[f,`rank ${e.user.rank} user`]]):l("",!0),s("img",{src:"https://a.ppy.sh/"+e.user.osuId,class:"list-avatar-img"},null,8,ue),h(u,{class:"ms-1",user:e.user},null,8,["user"])]),s("div",pe,[s("div",he,[b(" Total points: "),s("b",null,c(e.user.totalPoints),1)])]),s("div",me,[e.filterMode=="any"?(o(),i("div",ge,[b(" Available points: "+c(e.user.availablePoints)+" ",1),fe])):l("",!0),e.filterMode=="osu"?(o(),i("div",ye,[b(" osu! points: "),s("b",null,c(Math.round(e.user.osuPoints*10)/10),1)])):e.filterMode=="taiko"?(o(),i("div",_e,[b(" osu!taiko points: "),s("b",null,c(Math.round(e.user.taikoPoints*10)/10),1)])):e.filterMode=="catch"?(o(),i("div",be,[b(" osu!catch points: "),s("b",null,c(Math.round(e.user.catchPoints*10)/10),1)])):e.filterMode=="mania"?(o(),i("div",ke,[b(" osu!mania points: "),s("b",null,c(Math.round(e.user.maniaPoints*10)/10),1)])):l("",!0)])])],6)}const Ue=S(ae,[["render",$e],["__scopeId","data-v-80ba355e"]]),Pe=M({name:"UserPointsRow",props:{points:{type:Number,required:!0},display:{type:String,required:!0},tooltipTitle:{type:String,required:!0}}}),ve={class:"text-secondary"},we={scope:"row"},Me={scope:"row"};function Se(e,t,n,a,y,P){const u=I("bs-tooltip");return o(),i("tr",ve,[v((o(),i("td",we,[b(c(e.display),1)])),[[u,e.tooltipTitle,"left"]]),s("td",Me,c(Math.round(e.points*10)/10),1)])}const Ce=S(Pe,[["render",Se]]),qe=M({props:{points:{type:Number,required:!0},bgClass:{type:String,required:!0},tooltipText:{type:String,required:!0},displayText:{type:String,required:!0},badge:{type:String,default:"main"}},computed:{...T("users",["selectedUser"]),maxPoints(){if(this.badge=="mission")return this.selectedUser.completedMissions.length>3?this.selectedUser.completedMissions.length:3;let e;switch(this.selectedUser.rank){case 0:e=100;break;case 1:e=250;break;case 2:e=500;break;case 3:e=1e3;break;case 4:e=2500;break;case 5:e=this.selectedUser.totalPoints;break}return e}},methods:{generateWidth(e){return`width: ${e/(this.maxPoints/100)}%;`},generateTooltipText(){return this.badge=="main"?`${this.tooltipText} (${Math.round(this.points)} points)`:this.tooltipText},generateDisplayText(){return this.badge=="main"?`${this.displayText} (${Math.round(this.points)} points)`:this.displayText}}});const Ie={class:"segment-text"};function Ae(e,t,n,a,y,P){const u=I("bs-tooltip");return v((o(),i("div",{key:e.$route.query.id,class:w(["segment",e.bgClass]),style:G(e.generateWidth(e.points))},[s("span",Ie,c(e.generateDisplayText()),1)],6)),[[u,e.generateTooltipText()]])}const Te=S(qe,[["render",Ae],["__scopeId","data-v-6d7df64b"]]),Fe=M({name:"RewardProgress",components:{RewardProgressSegment:Te},props:{badge:{type:String,required:!0}},data(){return{bgOptions:["bg-easy","bg-normal","bg-hard","bg-insane","bg-expert","bg-rank-0","bg-rank-4","bg-wip","bg-qualified","bg-done"]}},computed:{...T("users",["selectedUser"]),maxPoints(){if(this.badge=="mission")return this.selectedUser.completedMissions.length>3?this.selectedUser.completedMissions.length:3;let e;switch(this.selectedUser.rank){case 0:e=100;break;case 1:e=250;break;case 2:e=500;break;case 3:e=1e3;break;case 4:e=2500;break;case 5:e=this.selectedUser.totalPoints;break}return e}}});const Qe={class:"d-flex mb-2"},Be={href:"https://osu.ppy.sh/wiki/en/Community/Mappers_Guild#rewards",target:"_blank"},De=["src"],Ne={href:"https://osu.ppy.sh/wiki/en/Community/Mappers_Guild#rewards",target:"_blank",class:"ms-auto"},Oe=["src"],Ve={href:"/missions",target:"_blank",class:"mt-3"},Ge=["src"],Re={class:"progress-bar osu-badge"};function Ee(e,t,n,a,y,P){const u=k("reward-progress-segment"),f=I("bs-tooltip");return o(),i(g,null,[s("div",Qe,[s("a",Be,[e.selectedUser.rank>0&&e.badge=="main"?v((o(),i("img",{key:e.$route.query.id,src:`/images/rank${e.selectedUser.rank}.png`,class:"osu-badge badge-small"},null,8,De)),[[f,`${e.selectedUser.username}'s current MG rank`]]):l("",!0)]),s("a",Ne,[e.selectedUser.rank<5&&e.badge=="main"?v((o(),i("img",{key:e.$route.query.id,src:`/images/rank${e.selectedUser.rank+1}.png`,class:"osu-badge badge-small"},null,8,Oe)),[[f,`${e.selectedUser.username}'s next MG rank`]]):l("",!0)]),s("a",Ve,[e.badge=="mission"?v((o(),i("img",{key:e.$route.query.id,src:"/images/questbadge.png",class:"osu-badge badge-small"},null,8,Ge)),[[f,"quest trailblazer"]]):l("",!0)])]),s("div",Re,[e.badge=="main"?(o(),i(g,{key:0},[h(u,{points:e.selectedUser.easyPoints,"bg-class":"bg-easy","tooltip-text":"mapping Easy difficulties","display-text":"Easy"},null,8,["points"]),h(u,{points:e.selectedUser.normalPoints,"bg-class":"bg-normal","tooltip-text":"mapping Normal difficulties","display-text":"Normal"},null,8,["points"]),h(u,{points:e.selectedUser.hardPoints,"bg-class":"bg-hard","tooltip-text":"mapping Hard difficulties","display-text":"Hard"},null,8,["points"]),h(u,{points:e.selectedUser.insanePoints,"bg-class":"bg-insane","tooltip-text":"mapping Insane difficulties","display-text":"Insane"},null,8,["points"]),h(u,{points:e.selectedUser.expertPoints,"bg-class":"bg-expert","tooltip-text":"mapping Expert difficulties","display-text":"Expert"},null,8,["points"]),h(u,{points:e.selectedUser.hitsoundPoints,"bg-class":"bg-rank-0","tooltip-text":"Hitsounding","display-text":"HS"},null,8,["points"]),h(u,{points:e.selectedUser.storyboardPoints,"bg-class":"bg-rank-4","tooltip-text":"Storyboarding","display-text":"SB"},null,8,["points"]),h(u,{points:e.selectedUser.questPoints,"bg-class":"bg-wip","tooltip-text":"Completing quests","display-text":"Quests"},null,8,["points"]),h(u,{points:e.selectedUser.missionPoints,"bg-class":"bg-qualified","tooltip-text":"Completing priority quests","display-text":"Priority quests"},null,8,["points"]),h(u,{points:e.selectedUser.modPoints,"bg-class":"bg-done","tooltip-text":"Modding","display-text":"Mods"},null,8,["points"]),h(u,{points:e.selectedUser.hostPoints,"bg-class":"bg-ranked","tooltip-text":"Hosting mapsets","display-text":"Host"},null,8,["points"]),h(u,{points:e.selectedUser.contestCreatorPoints+e.selectedUser.contestParticipantPoints+e.selectedUser.contestScreenerPoints+e.selectedUser.contestJudgePoints,"bg-class":"bg-open","tooltip-text":"Anything related to FA mapping contests ","display-text":"Contests"},null,8,["points"]),h(u,{points:e.selectedUser.legacyPoints,"bg-class":"bg-blocked","tooltip-text":"Legacy","display-text":"Legacy"},null,8,["points"]),h(u,{points:e.maxPoints-e.selectedUser.totalPoints,"bg-class":"bg-black","tooltip-text":"Points until next badge","display-text":"..."},null,8,["points","display-text"])],64)):e.badge=="mission"?(o(),i(g,{key:1},[(o(!0),i(g,null,U(e.selectedUser.completedMissions,(d,_)=>(o(),p(u,{key:_,points:1,"bg-class":e.bgOptions[_],"tooltip-text":d.name,"display-text":d.name,badge:"mission"},null,8,["bg-class","tooltip-text","display-text"]))),128)),h(u,{points:2,"bg-class":"bg-black","display-text":"...",badge:"mission"},null,8,["display-text"])],64)):l("",!0)])],64)}const Le=S(Fe,[["render",Ee],["__scopeId","data-v-dd5c44e5"]]),He=M({name:"UserInfo",components:{UserPointsRow:Ce,ModalDialog:L,ModesIcons:R,RewardProgress:Le},data(){return{currentQuests:[],currentMissions:[],createdQuestNames:[],spentPoints:[],userBeatmaps:[],sortOrder:Object.values(H)}},computed:{...C(["loggedInUser"]),...T("users",["selectedUser"]),userCoverUrl(){var e;return this.selectedUser?this.selectedUser.cover?(e=this.selectedUser.cover)==null?void 0:e.url:`https://a.ppy.sh/${this.selectedUser.osuId}`:""},userRankColor(){return this.selectedUser?`var(--rank-${this.selectedUser.rank}-bg)`:"var(--rank-0-bg)"}},watch:{async selectedUser(){await this.loadEverything()}},async created(){await this.loadEverything()},methods:{async loadEverything(){if(!this.selectedUser)return;this.$router.push(`/users?id=${this.selectedUser.id}`),this.currentQuests=[],this.currentMissions=[],this.createdQuestNames=[],this.spentPoints=[],this.userBeatmaps=[];const[e,t,n,a,y]=await Promise.all([this.$http.executeGet(`/users/${this.selectedUser.id}/quests`),this.$http.executeGet(`/users/${this.selectedUser.id}/missions`),this.$http.executeGet(`/users/findCreatedQuests/${this.selectedUser.id}`),this.$http.executeGet(`/users/findSpentPoints/${this.selectedUser.id}`),this.$http.executeGet(`/users/findUserBeatmaps/${this.selectedUser.id}`)]);if(this.$http.isError(e)||(this.currentQuests=e),this.$http.isError(t)||(this.currentMissions=t),this.$http.isError(n)||(this.createdQuestNames=n),this.$http.isError(a)||(this.spentPoints=a),!this.$http.isError(y)){const P=["WIP","Done","Qualified","Ranked"];this.userBeatmaps=y.sort(function(u,f){return P.indexOf(u.status)-P.indexOf(f.status)})}},findIcon(e){return e==A.WIP?"fa-ellipsis-h":e==A.Done?"fa-check":e==A.Qualified||e==A.Ranked?"fa-check-circle":""},userTasks(e){[...e.tasks].sort((a,y)=>this.sortOrder.indexOf(a.name)-this.sortOrder.indexOf(y.name));let n="";return e.tasks.forEach(a=>{a.mappers.forEach(y=>{y.id==this.selectedUser.id&&(n+=a.name+", ")})}),n.slice(0,-2)},calculatePoints(e){let t=25;return e.art||(t+=10),e.requiredMapsets<1?t=727:e.requiredMapsets==1?t+=100:e.requiredMapsets<10&&(t+=(10-e.requiredMapsets)*7.5),t},findSpentPointsAction(e){switch(e){case"acceptQuest":return"Accepted quest:";case"reopenQuest":return"Reopened quest:";case"extendDeadline":return"Extended quest deadline:";case"createQuest":return"Created quest:";case"rerollShowcaseMissionSong":return"Rerolled priority quest song:";default:return"undefined action"}},findSpentPointsValue(e,t){switch(e){case"acceptQuest":return t.price;case"reopenQuest":return t.reopenPrice;case"extendDeadline":return 10;case"createQuest":return this.calculatePoints(t);case"rerollShowcaseMissionSong":return 50;default:return 0}}}});const m=e=>(F("data-v-668559e3"),e=e(),Q(),e),je={class:"d-flex flex-row align-items-center gap-3"},ze=["src"],Je=m(()=>s("div",{class:"radial-divisor"},null,-1)),We={class:"row"},Ke={class:"col-md-6"},Xe={class:"table table-sm small"},Ye=m(()=>s("thead",null,[s("tr",null,[s("th",{scope:"col"}," Task "),s("th",{scope:"col"}," Points ")])],-1)),Ze=m(()=>s("td",{scope:"row"}," Total points earned ",-1)),xe={scope:"row"},es=m(()=>s("td",{scope:"row"}," Available points ",-1)),ss={scope:"row"},ts=m(()=>s("i",{class:"fas fa-coins"},null,-1)),os={class:"col-md-6"},is={class:"small"},rs={key:1,class:"text-secondary"},ns={key:0,class:"small"},as={class:"p-0 mb-2 ms-4"},ls=["href"],ds={key:1,class:"small"},cs={class:"p-0 mb-2 ms-4"},us=["href"],ps=m(()=>s("div",{class:"small"}," Completed priority quests: ",-1)),hs={class:"p-0 mb-2 ms-4"},ms=["href"],gs=m(()=>s("div",{class:"small"}," Completed quests: ",-1)),fs={class:"p-0 mb-2 ms-4"},ys=["href"],_s={key:4,class:"small"},bs={class:"p-0 mb-2 ms-4"},ks=m(()=>s("div",{class:"radial-divisor"},null,-1)),$s={class:"row"},Us={class:"col-sm"},Ps=m(()=>s("p",null,"Mappers' Guild beatmaps:",-1)),vs={class:"table table-sm"},ws=m(()=>s("thead",null,[s("tr",null,[s("th",{scope:"col"}," Mapset "),s("th",{scope:"col"}," Host "),s("th",{scope:"col"}," Tasks "),s("th",{scope:"col"})])],-1)),Ms={key:0},Ss=m(()=>s("td",{scope:"row"}," ... ",-1)),Cs=m(()=>s("td",{scope:"row"}," ... ",-1)),qs=m(()=>s("td",{scope:"row"}," ... ",-1)),Is=m(()=>s("td",{scope:"row"},null,-1)),As=[Ss,Cs,qs,Is],Ts={scope:"row"},Fs=["href"],Qs={scope:"row"},Bs={scope:"row",class:"text-secondary"},Ds={scope:"row",class:"text-secondary"},Ns=["href"],Os=m(()=>s("i",{class:"fas fa-link"},null,-1)),Vs=[Os],Gs=m(()=>s("div",{class:"radial-divisor"},null,-1)),Rs={class:"row"},Es={class:"col-sm"},Ls=m(()=>s("p",null,"Spent points logs:",-1)),Hs={class:"table table-sm"},js=m(()=>s("thead",null,[s("tr",null,[s("th",{scope:"col"}," Action "),s("th",{scope:"col"}," Spent points ")])],-1)),zs={key:0},Js=m(()=>s("td",{scope:"row"}," ... ",-1)),Ws=m(()=>s("td",{scope:"row"}," ... ",-1)),Ks=[Js,Ws],Xs={scope:"row",class:"text-secondary"},Ys=["href"],Zs=["href"],xs={scope:"row",class:"text-secondary"},et=m(()=>s("i",{class:"fas fa-coins"},null,-1)),st=m(()=>s("div",{class:"radial-divisor"},null,-1)),tt={class:"float-end"};function ot(e,t,n,a,y,P){const u=k("user-link"),f=k("reward-progress"),d=k("user-points-row"),_=k("modes-icons"),$=k("modal-dialog"),B=I("bs-tooltip");return o(),p($,{id:"extendedInfo",loaded:!!e.selectedUser,"header-style":{background:`linear-gradient(0deg, ${e.userRankColor} -250%, rgba(0, 0, 0, 0.65) 130%), url(${e.userCoverUrl}) center no-repeat`,borderBottom:`4px solid ${e.userRankColor}`,backgroundSize:"cover",objectFit:"fill"}},{header:q(()=>[s("div",je,[s("img",{src:"https://a.ppy.sh/"+e.selectedUser.osuId,class:"avatar-img"},null,8,ze),h(u,{class:"text-white ml-3",user:e.selectedUser},null,8,["user"])])]),default:q(()=>{var D;return[h(f,{badge:"main"}),e.selectedUser.completedMissions&&e.selectedUser.completedMissions.length?(o(),p(f,{key:0,badge:"mission"})):l("",!0),Je,s("div",We,[s("div",Ke,[s("table",Xe,[Ye,s("tbody",null,[e.selectedUser.easyPoints?(o(),p(d,{key:0,points:e.selectedUser.easyPoints,display:"mapping Easy difficulties","tooltip-title":"~5 points per difficulty. +2 if quest mapset"},null,8,["points","tooltip-title"])):l("",!0),e.selectedUser.normalPoints?(o(),p(d,{key:1,points:e.selectedUser.normalPoints,display:"mapping Normal difficulties","tooltip-title":"~6 points per difficulty. +2 if quest mapset"},null,8,["points","tooltip-title"])):l("",!0),e.selectedUser.hardPoints?(o(),p(d,{key:2,points:e.selectedUser.hardPoints,display:"mapping Hard difficulties","tooltip-title":"~7 points per difficulty. +2 if quest mapset"},null,8,["points","tooltip-title"])):l("",!0),e.selectedUser.insanePoints?(o(),p(d,{key:3,points:e.selectedUser.insanePoints,display:"mapping Insane difficulties","tooltip-title":"~8 points per difficulty. +2 if quest mapset"},null,8,["points","tooltip-title"])):l("",!0),e.selectedUser.expertPoints?(o(),p(d,{key:4,points:e.selectedUser.expertPoints,display:"mapping Expert difficulties","tooltip-title":"~8 points per difficulty. +2 if quest mapset"},null,8,["points","tooltip-title"])):l("",!0),e.selectedUser.hitsoundPoints?(o(),p(d,{key:5,points:e.selectedUser.hitsoundPoints,display:"hitsounding","tooltip-title":"~2 points per mapset"},null,8,["points"])):l("",!0),e.selectedUser.storyboardPoints?(o(),p(d,{key:6,points:e.selectedUser.storyboardPoints,display:"creating storyboards","tooltip-title":"2, 7.5, or 10 points per storyboard"},null,8,["points","tooltip-title"])):l("",!0),e.selectedUser.questPoints?(o(),p(d,{key:7,points:e.selectedUser.questPoints,display:"completing quests","tooltip-title":"7 bonus points for completing quests on time"},null,8,["points"])):l("",!0),e.selectedUser.missionPoints?(o(),p(d,{key:8,points:e.selectedUser.missionPoints,display:"completing priority quests","tooltip-title":"5-24 bonus points for completing priority quests"},null,8,["points"])):l("",!0),e.selectedUser.modPoints?(o(),p(d,{key:9,points:e.selectedUser.modPoints,display:"modding mapsets","tooltip-title":"~1 point per mod"},null,8,["points"])):l("",!0),e.selectedUser.hostPoints?(o(),p(d,{key:10,points:e.selectedUser.hostPoints,display:"hosting mapsets","tooltip-title":"3 points per mapset hosted"},null,8,["points"])):l("",!0),e.selectedUser.contestCreatorPoints?(o(),p(d,{key:11,points:e.selectedUser.contestCreatorPoints,display:"FA contest creation","tooltip-title":"creation of FA beatmapping contests hosted on Mappers' Guild"},null,8,["points"])):l("",!0),e.selectedUser.contestParticipantPoints?(o(),p(d,{key:12,points:e.selectedUser.contestParticipantPoints,display:"FA contest participation","tooltip-title":"participating in FA beatmapping contests hosted on Mappers' Guild"},null,8,["points"])):l("",!0),e.selectedUser.contestScreenerPoints?(o(),p(d,{key:13,points:e.selectedUser.contestScreenerPoints,display:"FA contest screening","tooltip-title":"screening entries in FA beatmapping contests hosted on Mappers' Guild"},null,8,["points"])):l("",!0),e.selectedUser.contestJudgePoints?(o(),p(d,{key:14,points:e.selectedUser.contestJudgePoints,display:"FA contest judging","tooltip-title":"judging entries in FA beatmapping contests hosted on Mappers' Guild"},null,8,["points"])):l("",!0),e.selectedUser.legacyPoints?(o(),p(d,{key:15,points:e.selectedUser.legacyPoints,display:"legacy","tooltip-title":"points for things that are no longer applicable to Mappers' Guild"},null,8,["points"])):l("",!0),e.selectedUser.osuPoints?(o(),p(d,{key:16,points:e.selectedUser.osuPoints,display:"Total osu! points","tooltip-title":"mapping osu! game mode"},null,8,["points"])):l("",!0),e.selectedUser.taikoPoints?(o(),p(d,{key:17,points:e.selectedUser.taikoPoints,display:"Total osu!taiko points","tooltip-title":"mapping osu!taiko game mode"},null,8,["points"])):l("",!0),e.selectedUser.catchPoints?(o(),p(d,{key:18,points:e.selectedUser.catchPoints,display:"Total osu!catch points","tooltip-title":"mapping osu!catch game mode"},null,8,["points"])):l("",!0),e.selectedUser.maniaPoints?(o(),p(d,{key:19,points:e.selectedUser.maniaPoints,display:"Total osu!mania points","tooltip-title":"mapping osu!mania game mode"},null,8,["points"])):l("",!0),s("tr",null,[Ze,s("td",xe,c(e.selectedUser.totalPoints),1)]),s("tr",null,[es,s("td",ss,[b(c(e.selectedUser.availablePoints)+" ",1),ts])])])])]),s("div",os,[s("p",is,[b(" Rank: "),e.selectedUser.rank>0?v((o(),i("i",{key:(D=e.$route.query.id)==null?void 0:D.toString(),class:w(["fas fa-crown","text-rank-"+e.selectedUser.rank])},null,2)),[[B,`rank ${e.selectedUser.rank} user`]]):(o(),i("span",rs," None "))]),e.currentMissions.length?(o(),i("div",ns," Current missions: ")):l("",!0),s("ul",as,[(o(!0),i(g,null,U(e.currentMissions,r=>(o(),i("li",{key:r.id,class:"small text-secondary"},[s("a",{href:"/missions?id="+r.id,target:"_blank"},c(r.name.length>40?r.name.slice(0,40)+"...":r.name),9,ls)]))),128))]),e.currentQuests.length?(o(),i("div",ds," Current quests: ")):l("",!0),s("ul",cs,[(o(!0),i(g,null,U(e.currentQuests,r=>(o(),i("li",{key:r.id,class:"small text-secondary"},[s("a",{href:"/quests?id="+r.id,target:"_blank"},c(r.name.length>40?r.name.slice(0,40)+"...":r.name),9,us)]))),128))]),e.selectedUser.completedMissions&&e.selectedUser.completedMissions.length?(o(),i(g,{key:2},[ps,s("ul",hs,[(o(!0),i(g,null,U(e.selectedUser.completedMissions,r=>(o(),i("li",{key:r.id,class:"small text-secondary"},[s("a",{href:"/missions?id="+r.id,target:"_blank"},c(r.name.length>40?r.name.slice(0,40)+"...":r.name),9,ms)]))),128))])],64)):l("",!0),e.selectedUser.completedQuests&&e.selectedUser.completedQuests.length?(o(),i(g,{key:3},[gs,s("ul",fs,[(o(!0),i(g,null,U(e.selectedUser.completedQuests,r=>(o(),i("li",{key:r.id,class:"small text-secondary"},[s("a",{href:"/quests?id="+r.id,target:"_blank"},c(r.name.length>40?r.name.slice(0,40)+"...":r.name),9,ys)]))),128))])],64)):l("",!0),e.createdQuestNames.length?(o(),i("div",_s," Created quests: ")):l("",!0),s("ul",bs,[(o(!0),i(g,null,U(e.createdQuestNames,r=>(o(),i("li",{key:r,class:"small text-secondary"},c(r.length>40?r.slice(0,40)+"...":r),1))),128))])])]),ks,s("div",$s,[s("div",Us,[Ps,s("table",vs,[ws,s("tbody",null,[e.userBeatmaps.length?l("",!0):(o(),i("tr",Ms,As)),(o(!0),i(g,null,U(e.userBeatmaps,r=>(o(),i("tr",{key:r.id},[s("td",Ts,[v(s("i",{class:w(["fas me-1",["text-"+r.status.toLowerCase(),e.findIcon(r.status)]])},null,2),[[B,r.status]]),s("a",{href:"/beatmaps?id="+r.id,target:"_blank",class:"me-1"},c(r.song.artist)+" - "+c(r.song.title),9,Fs),r.mode!=="osu"?(o(),p(_,{key:0,modes:[r.mode],color:"secondary"},null,8,["modes"])):l("",!0)]),s("td",Qs,[h(u,{user:r.host},null,8,["user"])]),s("td",Bs,c(e.userTasks(r)),1),s("td",Ds,[r.url?(o(),i("a",{key:0,href:r.url,target:"_blank"},Vs,8,Ns)):l("",!0)])]))),128))])])])]),Gs,s("div",Rs,[s("div",Es,[Ls,s("table",Hs,[js,s("tbody",null,[e.spentPoints.length?l("",!0):(o(),i("tr",zs,Ks)),(o(!0),i(g,null,U(e.spentPoints,r=>(o(),i("tr",{key:r.id},[s("td",Xs,[b(c(e.findSpentPointsAction(r.category))+" ",1),r.quest?(o(),i("a",{key:0,href:"/quests/?id="+r.quest.id,target:"_blank"},c(r.quest.name),9,Ys)):r.mission?(o(),i("a",{key:1,href:"/missions/?id="+r.mission.id,target:"_blank"},c(r.mission.name),9,Zs)):l("",!0)]),s("td",xs,[b(c(e.findSpentPointsValue(r.category,r.quest))+" ",1),et])]))),128))])])])]),st,s("p",tt," Joined: "+c(e.selectedUser.createdAt.slice(0,10)),1)]}),_:1},8,["loaded","header-style"])}const it=S(He,[["render",ot],["__scopeId","data-v-668559e3"]]),rt=M({name:"UserPageFilters",components:{FilterBox:j,ModeFilters:z},data(){return{sorted:!1,sortOptions:{username:"Name",rank:"Rank",createdAt:"Joined"},displayOptions:{list:"List",cards:"Cards"}}},computed:C("users",["sortBy","displayAs","filterMode","filterValue"]),methods:{...E("users",["updateDisplay","updateSorting","updateFilterValue","updateFilterMode"])}}),nt={class:"card card-body mb-2"},at={class:"container"},lt={class:"row small mt-3"},dt=s("div",{class:"col-auto filter-title"}," Sort ",-1),ct={class:"col"},ut=["onClick"],pt={class:"row small mt-3"},ht=s("div",{class:"col-auto filter-title"}," Display ",-1),mt={class:"col"},gt=["onClick"];function ft(e,t,n,a,y,P){const u=k("mode-filters"),f=k("filter-box");return o(),i("div",nt,[s("div",at,[h(f,{placeholder:"enter to search for username...","filter-value":e.filterValue,"onUpdate:filterValue":t[1]||(t[1]=d=>e.updateFilterValue(d))},{filters:q(()=>[h(u,{"filter-mode":e.filterMode,"onUpdate:filterMode":t[0]||(t[0]=d=>e.updateFilterMode(d))},null,8,["filter-mode"])]),_:1},8,["filter-value"]),s("div",lt,[dt,s("div",ct,[(o(!0),i(g,null,U(e.sortOptions,(d,_)=>(o(),i("a",{key:_,class:w(e.sortBy===_?"sorted":"unsorted"),href:"#",onClick:N($=>e.updateSorting(_),["prevent"])},c(d),11,ut))),128))])]),s("div",pt,[ht,s("div",mt,[(o(!0),i(g,null,U(e.displayOptions,(d,_)=>(o(),i("a",{key:_,class:w(e.displayAs===_?"sorted":"unsorted"),href:"#",onClick:N($=>e.updateDisplay(_),["prevent"])},c(d),11,gt))),128))])])])])}const yt=S(rt,[["render",ft]]),_t={namespaced:!0,state:{users:[],selectedUserId:null,filterValue:"",filterMode:V.any,sortBy:"rank",displayAs:"list",sortDesc:!0,pagination:{page:1,limit:16,maxPages:1}},mutations:{setUsers(e,t){e.users=t},setFilterValue(e,t){e.filterValue=t},setFilterMode(e,t){e.filterMode=t},setSelectedUserId(e,t){e.selectedUserId=t},updateUser(e,t){const n=e.users.findIndex(a=>a.id===t.id);n!==-1&&(e.users[n]=t)},setSortBy(e,t){e.sortBy=t},setSortDesc(e,t){e.sortDesc=t},setDisplayAs(e,t){e.displayAs=t},increasePaginationPage(e){e.pagination.page+=1},decreasePaginationPage(e){e.pagination.page-=1},resetPaginationPage(e){e.pagination.page=1},updatePaginationMaxPages(e,t){e.pagination.maxPages=t}},getters:{filteredUsers:e=>{let t=[...e.users];if(e.filterMode!==V.any){const n=e.filterMode;t=t.filter(a=>!!(n=="osu"&&a.osuPoints||n=="taiko"&&a.taikoPoints||n=="catch"&&a.catchPoints||n=="mania"&&a.maniaPoints))}return e.filterValue.length>2&&(t=t.filter(n=>n.username.toLowerCase().includes(e.filterValue.toLowerCase()))),e.sortBy==="createdAt"?t.sort((n,a)=>+n.createdAt-+a.createdAt):e.sortBy==="username"?t.sort((n,a)=>a.username.toLowerCase().localeCompare(n.username.toLowerCase())):e.sortBy==="rank"&&(e.filterMode==="osu"?t.sort((n,a)=>n.osuPoints-a.osuPoints):e.filterMode==="taiko"?t.sort((n,a)=>n.taikoPoints-a.taikoPoints):e.filterMode==="catch"?t.sort((n,a)=>n.catchPoints-a.catchPoints):e.filterMode==="mania"?t.sort((n,a)=>n.maniaPoints-a.maniaPoints):t.sort((n,a)=>n.totalPoints-a.totalPoints)),e.sortDesc&&t.reverse(),t},paginatedUsers:(e,t)=>t.filteredUsers.slice(e.pagination.limit*(e.pagination.page-1),e.pagination.limit*e.pagination.page),selectedUser:e=>e.users.find(t=>t.id===e.selectedUserId),allUsers:e=>e.users},actions:{updateFilterMode({commit:e},t){e("resetPaginationPage"),e("setFilterMode",t)},updateFilterValue({commit:e},t){e("resetPaginationPage"),e("setFilterValue",t)},updatePaginationMaxPages({commit:e,getters:t,state:n}){const a=Math.ceil(t.filteredUsers.length/n.pagination.limit);e("updatePaginationMaxPages",a)},updateSorting({commit:e,state:t},n){t.sortBy!==n||t.sortDesc===!1?e("setSortDesc",!0):e("setSortDesc",!1),e("setSortBy",n)},updateDisplay({commit:e,state:t},n){t.displayAs!==n&&(e("setDisplayAs",n),console.log(n))}}},bt=_t,kt=M({name:"UserPage",components:{UserCard:ne,UserInfo:it,UserPageFilters:yt,UserListElement:Ue},computed:{...C(["loggedInUser"]),...C("users",["pagination","displayAs"]),...T("users",["paginatedUsers","allUsers","filteredUsers"])},watch:{paginatedUsers(){this.$store.dispatch("users/updatePaginationMaxPages")}},beforeCreate(){this.$store.hasModule("users")||this.$store.registerModule("users",bt)},async created(){const e=await this.$http.initialRequest("/users/query");if(!this.$http.isError(e)){this.$store.commit("users/setUsers",e.users);const t=this.$route.query.id;t&&this.allUsers.findIndex(a=>a.id==t)>=0&&(this.$store.commit("users/setSelectedUserId",t),this.$bs.showModal("extendedInfo"))}},methods:{showOlder(){this.$store.commit("users/increasePaginationPage")},showNewer(){this.$store.commit("users/decreasePaginationPage")}}}),$t={key:0,class:"container card card-body py-3"},Ut=["disabled"],Pt=s("i",{class:"fas fa-angle-up me-1"},null,-1),vt=s("i",{class:"fas fa-angle-up ms-1"},null,-1),wt={class:"small text-center mx-auto"},Mt=["disabled"],St=s("i",{class:"fas fa-angle-down me-1"},null,-1),Ct=s("i",{class:"fas fa-angle-down ms-1"},null,-1),qt={key:1,class:"container card card-body py-3"},It=s("div",{class:"radial-divisor"},null,-1);function At(e,t,n,a,y,P){const u=k("user-page-filters"),f=k("user-card"),d=k("user-list-element"),_=k("user-info");return o(),i("div",null,[h(u),e.displayAs=="cards"?(o(),i("div",$t,[s("button",{disabled:e.pagination.page==1,class:"btn btn-sm btn-primary mx-auto my-2 d-block",type:"button",onClick:t[0]||(t[0]=(...$)=>e.showNewer&&e.showNewer(...$))},[Pt,b(" show newer "),vt],8,Ut),s("div",null,[h(O,{name:"list",tag:"div",class:"row px-3"},{default:q(()=>[(o(!0),i(g,null,U(e.paginatedUsers,$=>(o(),p(f,{key:$.id,user:$},null,8,["user"]))),128))]),_:1}),s("div",wt,c(e.paginatedUsers.length===0?"0":e.pagination.page)+" of "+c(e.pagination.maxPages),1),s("button",{disabled:e.pagination.page>=e.pagination.maxPages,class:"btn btn-sm btn-primary mx-auto my-2 d-block",type:"button",onClick:t[1]||(t[1]=(...$)=>e.showOlder&&e.showOlder(...$))},[St,b(" show older "),Ct],8,Mt)])])):e.displayAs=="list"?(o(),i("div",qt,[h(O,{name:"list",tag:"div",class:"row px-3"},{default:q(()=>[(o(),p(d,{key:e.loggedInUser.id,user:e.loggedInUser},null,8,["user"])),It,(o(!0),i(g,null,U(e.filteredUsers,$=>(o(),p(d,{key:$.id,user:$},null,8,["user"]))),128))]),_:1})])):l("",!0),h(_)])}const Nt=S(kt,[["render",At]]);export{Nt as default};
