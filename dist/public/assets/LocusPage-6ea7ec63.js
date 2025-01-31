import{d as v,m as h,y as U,_ as $,o as i,e as n,i as b,a as o,F as g,r as I,n as T,z as C,t as u,q as f,k as d,j as a,u as R,x as z,b as m,v as k,f as y,A as D,c as E,$ as P}from"./index-60de7c05.js";import{F as S}from"./FilterBox-cfac27dd.js";import{U as A}from"./user-a97d0bc7.js";const V={namespaced:!0,state:{filterValue:"",locusInfos:[],selfLocusInfo:null},mutations:{setFilterValue(s,e){s.filterValue=e},setLocusInfos(s,e){s.locusInfos=e},setSelfLocusInfo(s,e){s.selfLocusInfo=e},setRoleIs(s,e){s.roleIs=e},updateTimezone(s,e){s.selfLocusInfo.timezone=e,this.commit("locus/updateSelfInListing")},updateAvailability(s,e){s.selfLocusInfo.availability=e,this.commit("locus/updateSelfInListing")},updateLanguage(s,e){if(s.selfLocusInfo.languages&&s.selfLocusInfo.languages.length){const l=s.selfLocusInfo.languages.findIndex(c=>c==e);l>-1?s.selfLocusInfo.languages.splice(l,1):s.selfLocusInfo.languages.push(e)}else s.selfLocusInfo.languages=[e];this.commit("locus/updateSelfInListing")},updateRole(s,e){if(s.selfLocusInfo.roles&&s.selfLocusInfo.roles.length){const l=s.selfLocusInfo.roles.findIndex(c=>c==e);l>-1?s.selfLocusInfo.roles.splice(l,1):s.selfLocusInfo.roles.push(e)}else s.selfLocusInfo.roles=[e];this.commit("locus/updateSelfInListing")},updateDiscord(s,e){s.selfLocusInfo.discord=e,this.commit("locus/updateSelfInListing")},updateEmail(s,e){s.selfLocusInfo.email=e,this.commit("locus/updateSelfInListing")},updateAbout(s,e){s.selfLocusInfo.about=e,this.commit("locus/updateSelfInListing")},updateIsPublic(s,e){s.selfLocusInfo.isPublic=e,this.commit("locus/updateSelfInListing")},updateIsOnTeam(s,e){s.selfLocusInfo.isOnTeam=e,this.commit("locus/updateSelfInListing")},adminUpdateIsOnTeam(s,e){const l=s.locusInfos.findIndex(c=>c.id==e.id);s.locusInfos[l].isOnTeam=e.isOnTeam},updateSelfInListing(s){const e=s.locusInfos.findIndex(l=>l.id==s.selfLocusInfo.id);s.locusInfos[e]=s.selfLocusInfo}},getters:{filteredLocusInfos:s=>{let e=s.locusInfos;return s.filterValue.length&&(e=e.filter(l=>{let c;return l.user.username.toLowerCase().includes(s.filterValue.toLowerCase())&&(c=!0),l.user.osuId.toString().includes(s.filterValue)&&(c=!0),l.languages.includes(s.filterValue.toLowerCase())&&(c=!0),c})),s.roleIs&&s.roleIs!=="any"&&(e=e.filter(l=>l.roles.includes(s.roleIs))),e}},actions:{updateFilterValue({commit:s},e){s("setFilterValue",e)},updateRole({commit:s,state:e},l){l=="designer"&&(l="visual designer"),e.roleIs!==l&&s("setRoleIs",l)}}},M=V,F=v({name:"LocusPageFilters",components:{FilterBox:S},data(){return{roleOptions:{any:"Any",designer:"Visual designer",mapper:"Mapper",musician:"Musician"}}},computed:h("locus",["roleIs"]),methods:U("locus",["updateFilterValue","updateRole"])}),N={class:"container card card-body py-3 mb-2"},j={class:"row small mt-3"},q=o("div",{class:"col-auto filter-title"}," Role ",-1),B={class:"col"},Y=["onClick"];function W(s,e,l,c,L,_){const r=f("filter-box");return i(),n("div",N,[b(r,{placeholder:"search username...","onUpdate:filterValue":e[0]||(e[0]=t=>s.updateFilterValue(t))}),o("div",j,[q,o("div",B,[(i(!0),n(g,null,I(s.roleOptions,(t,p)=>(i(),n("a",{key:p,class:T(s.roleIs===p?"sorted":"unsorted"),href:"#",onClick:C(w=>s.updateRole(p),["prevent"])},u(t),11,Y))),128))])])])}const H=$(F,[["render",W]]),G=v({name:"LocusCard",props:{locusInfo:{type:Object,required:!0}},computed:{...h(["loggedInUser"]),isAdmin(){return this.loggedInUser.group==A.Admin||this.loggedInUser.group==A.Locus}},methods:{async adminToggleIsOnTeam(s){const e=await this.$http.executePost(`/locus/${this.locusInfo.id}/toggleIsOnTeam`,{},s);this.$http.isError(e)||(this.$store.dispatch("updateToastMessages",{message:"Updated team status",type:"info"}),this.$store.commit("locus/adminUpdateIsOnTeam",{isOnTeam:e,id:this.locusInfo.id}))}}});const J=s=>(R("data-v-69cc27f1"),s=s(),z(),s),K={key:1,class:"on-team-text fs-1 pointer-events-none"},Q=["src"],X={class:"ms-3 mt-1 mb-1"},Z={class:"ms-3"},x={key:0,class:"ms-2 text-secondary text-capitalize"},ss={key:1,class:"ms-2 text-secondary"},es={key:0,class:"mb-3"},os={key:1,class:"small"},ts={key:0},is={class:"text-secondary"},ns={key:1},ls={class:"text-secondary"},as={key:2,class:"ms-2"},us={class:"text-secondary"},ds={key:2,class:"small"},cs={class:"text-secondary"},rs=J(()=>o("a",{href:"https://www.timeanddate.com/time/map/#!cities=1440",target:"_blank"},"UTC",-1)),ms={key:3,class:"small"},fs={class:"text-secondary"},hs={key:4,class:"small"},ps={class:"text-secondary text-capitalize"},gs={key:5},Is={key:6,class:"small"},bs=["innerHTML"];function ys(s,e,l,c,L,_){const r=f("user-link");return s.locusInfo?(i(),n("div",{key:0,class:T(["position-relative",s.locusInfo.isOnTeam?"on-team opacity-50":""])},[s.isAdmin?(i(),n("button",{key:0,class:"btn btn-sm btn-outline-danger top-right-button",onClick:e[0]||(e[0]=t=>s.adminToggleIsOnTeam(t))},u(s.locusInfo.isOnTeam?'Mark as "not on a team"':'Mark as "on a team"'),1)):d("",!0),s.locusInfo.isOnTeam?(i(),n("div",K," Joined a team ")):d("",!0),o("div",{class:T(["card card-level-2 card-body my-2",s.locusInfo.isOnTeam?"pointer-events-none":""])},[o("img",{src:"https://a.ppy.sh/"+s.locusInfo.user.osuId,class:"card-avatar-img"},null,8,Q),o("div",X,[b(r,{class:"ms-2",user:s.locusInfo.user},null,8,["user"])]),o("div",Z,[s.locusInfo.roles&&s.locusInfo.roles.length?(i(),n("i",x,u(s.locusInfo.roles.join(", ")),1)):(i(),n("i",ss,"No roles selected"))]),s.locusInfo.timezone||s.locusInfo.availability||s.locusInfo.languages&&s.locusInfo.languages.length||s.locusInfo.discord?(i(),n("hr",es)):d("",!0),s.locusInfo.discord||s.locusInfo.email?(i(),n("div",os,[s.locusInfo.discord&&s.locusInfo.discord.length&&s.locusInfo.email&&s.locusInfo.email.length?(i(),n("div",ts,[a(" Discord: "),o("span",is,[o("i",null,u(s.locusInfo.discord?s.locusInfo.discord:"Discord ID")+" ("+u(s.locusInfo.email)+")",1)])])):s.locusInfo.discord&&s.locusInfo.discord.length?(i(),n("div",ns,[a(" Discord: "),o("span",ls,[o("i",null,u(s.locusInfo.discord?s.locusInfo.discord:"Discord ID"),1)])])):!s.locusInfo.discord&&!s.locusInfo.discord.length&&s.locusInfo.email&&s.locusInfo.email.length?(i(),n("div",as,[a(" Email: "),o("span",us,[o("i",null,u(s.locusInfo.email),1)])])):d("",!0)])):d("",!0),s.locusInfo.timezone?(i(),n("div",ds,[a(" Timezone: "),o("i",cs,[a(u(s.locusInfo.timezone)+" ",1),rs])])):d("",!0),s.locusInfo.availability?(i(),n("div",ms,[a(" Availability: "),o("i",fs,u(s.locusInfo.availability),1)])):d("",!0),s.locusInfo.languages&&s.locusInfo.languages.length?(i(),n("div",hs,[a(" Languages: "),o("i",ps,"English, "+u(s.locusInfo.languages.join(", ")),1)])):d("",!0),s.locusInfo.about?(i(),n("hr",gs)):d("",!0),s.locusInfo.about?(i(),n("div",Is,[o("span",{class:"text-secondary",innerHTML:s.$md.render(s.locusInfo.about.trim())},null,8,bs)])):d("",!0)],2)],2)):d("",!0)}const O=$(G,[["render",ys],["__scopeId","data-v-69cc27f1"]]),vs=v({name:"SelfLocusInfo",components:{LocusCard:O},data(){return{timezoneOptions:["-11","-10","-9","-8","-7","-6","-5","-4","-3","-2","-1","+0","+1","+2","+3","+4","+5","+6","+7","+8","+9","+10","+11","+12"],languageOptions:["afrikaans","arabic","belarusian","cantonese","catalan","chinese","danish","dutch","filipino","finnish","french","galician","german","indonesian","italian","japanese","korean","lithuanian","malay","polish","portuguese","romanian","russian","serbian","spanish","swedish","thai","turkish","urdu","vietnamese"],roleOptions:["visual designer","mapper","musician"],newTimezone:"",newAvailability:"",newLanguage:"",newRole:"",newDiscord:"",newEmail:"",newAbout:""}},computed:{...h(["loggedInUser"]),...h("locus",["selfLocusInfo"]),userLanguages(){return this.selfLocusInfo&&this.selfLocusInfo.languages&&this.selfLocusInfo.languages.length?this.selfLocusInfo.languages:[]},userRoles(){return this.selfLocusInfo&&this.selfLocusInfo.roles&&this.selfLocusInfo.roles.length?this.selfLocusInfo.roles:[]}},watch:{selfLocusInfo(){this.newTimezone=this.selfLocusInfo.timezone,this.newAvailability=this.selfLocusInfo.availability,this.newDiscord=this.selfLocusInfo.discord,this.newEmail=this.selfLocusInfo.email,this.newAbout=this.selfLocusInfo.about}},methods:{async updateTimezone(s){const e=await this.$http.executePost(`/locus/${this.selfLocusInfo.id}/updateTimezone`,{timezone:this.newTimezone},s);this.$http.isError(e)||(this.$store.dispatch("updateToastMessages",{message:"Updated timezone",type:"info"}),this.$store.commit("locus/updateTimezone",e))},async updateAvailability(s){const e=await this.$http.executePost(`/locus/${this.selfLocusInfo.id}/updateAvailability`,{availability:this.newAvailability},s);this.$http.isError(e)||(this.$store.dispatch("updateToastMessages",{message:"Updated availability",type:"info"}),this.$store.commit("locus/updateAvailability",e))},async updateLanguage(s){const e=await this.$http.executePost(`/locus/${this.selfLocusInfo.id}/updateLanguage`,{language:this.newLanguage},s);this.$http.isError(e)||(this.$store.dispatch("updateToastMessages",{message:"Updated language",type:"info"}),this.$store.commit("locus/updateLanguage",e))},async updateRole(s){const e=await this.$http.executePost(`/locus/${this.selfLocusInfo.id}/updateRole`,{role:this.newRole},s);this.$http.isError(e)||(this.$store.dispatch("updateToastMessages",{message:"Updated role",type:"info"}),this.$store.commit("locus/updateRole",e))},async updateDiscord(s){const e=await this.$http.executePost(`/locus/${this.selfLocusInfo.id}/updateDiscord`,{discord:this.newDiscord},s);this.$http.isError(e)||(this.$store.dispatch("updateToastMessages",{message:"Updated discord",type:"info"}),this.$store.commit("locus/updateDiscord",e))},async updateEmail(s){const e=await this.$http.executePost(`/locus/${this.selfLocusInfo.id}/updateEmail`,{email:this.newEmail},s);this.$http.isError(e)||(this.$store.dispatch("updateToastMessages",{message:"Updated email",type:"info"}),this.$store.commit("locus/updateEmail",e))},async updateAbout(s){const e=await this.$http.executePost(`/locus/${this.selfLocusInfo.id}/updateAbout`,{about:this.newAbout},s);this.$http.isError(e)||(this.$store.dispatch("updateToastMessages",{message:"Updated about",type:"info"}),this.$store.commit("locus/updateAbout",e))},async toggleIsPublic(s){const e=await this.$http.executePost(`/locus/${this.selfLocusInfo.id}/toggleIsPublic`,{},s);this.$http.isError(e)||(this.$store.dispatch("updateToastMessages",{message:"Updated public display",type:"info"}),this.$store.commit("locus/updateIsPublic",e))},async toggleIsOnTeam(s){const e=await this.$http.executePost(`/locus/${this.selfLocusInfo.id}/toggleIsOnTeam`,{},s);this.$http.isError(e)||(this.$store.dispatch("updateToastMessages",{message:"Updated team status",type:"info"}),this.$store.commit("locus/updateIsOnTeam",e))}}}),$s={class:"row"},Ls={class:"col-sm-6"},_s={class:"mb-2"},ws={class:"small"},ks={class:"small text-secondary mb-1"},Ts={class:"mb-2"},As={class:"small"},Os={class:"small text-secondary mb-1"},Us={class:"mb-2"},Cs={class:"small"},Rs=o("div",{class:"small text-secondary"},' What roles best describe you? Feel free to elaborate in "about" section ',-1),zs={class:"input-group"},Ds=o("option",{value:"",selected:"",disabled:""}," Select a role ",-1),Es=["value"],Ps={class:"input-group-append"},Ss=["disabled"],Vs=o("i",{class:"fas fa-plus"},null,-1),Ms=[Vs],Fs={class:"input-group-append"},Ns=["disabled"],js=o("i",{class:"fas fa-minus"},null,-1),qs=[js],Bs=o("hr",null,null,-1),Ys={class:"mb-2"},Ws={class:"small"},Hs=o("div",{class:"small text-secondary"}," Your Discord ID (if you want to communicate through Discord) ",-1),Gs={class:"mb-2"},Js={class:"small"},Ks=o("div",{class:"small text-secondary"}," Your email (if you want to communicate through email) ",-1),Qs={class:"mb-2"},Xs={class:"small"},Zs=o("div",{class:"small text-secondary"},[a(" Relative to "),o("a",{href:"https://www.timeanddate.com/time/map/#!cities=1440",target:"_blank"},"UTC")],-1),xs=o("option",{value:"",selected:"",disabled:""}," Select a timezone ",-1),se=["value"],ee={class:"mb-2"},oe={class:"small"},te=o("div",{class:"small text-secondary"}," When you're usually available ",-1),ie={class:"mb-2"},ne={class:"small"},le=o("div",{class:"small text-secondary"}," Any languages you're comfortable communicating with (excluding English) ",-1),ae={class:"input-group"},ue=o("option",{value:"",selected:"",disabled:""}," Select a language ",-1),de=["value"],ce={class:"input-group-append"},re=["disabled"],me=o("i",{class:"fas fa-plus"},null,-1),fe=[me],he={class:"input-group-append"},pe=["disabled"],ge=o("i",{class:"fas fa-minus"},null,-1),Ie=[ge],be=o("hr",null,null,-1),ye={class:"mb-2"},ve={class:"small"},$e=o("div",{class:"small text-secondary"},[a(" Any info you'd like people to know about you, such as your preferred genres, mapping experience, or other relevant skills. This section also supports "),o("a",{href:"https://www.markdownguide.org/cheat-sheet/",target:"_blank"},"markdown"),a("! ")],-1),Le={key:0,class:"col-sm-6"},_e={class:"text-danger small mt-3"},we=o("hr",null,null,-1);function ke(s,e,l,c,L,_){const r=f("locus-card");return i(),n("div",null,[o("div",null,[o("div",null,[o("div",$s,[o("div",Ls,[o("div",_s,[o("div",ws,[a(" Visibility "),o("div",ks,[a(" Toggle this for public display. Your listing is currently "),o("i",null,u(s.selfLocusInfo.isPublic?"visible":"not visible"),1),a("! ")]),o("button",{class:"btn btn-sm btn-outline-info mb-2 w-100",onClick:e[0]||(e[0]=t=>s.toggleIsPublic(t))},u(s.selfLocusInfo.isPublic?"Hide from public listing":"Show on public listing"),1)])]),o("div",Ts,[o("div",As,[a(" Team status "),o("div",Os,[a(" Toggle this to show if you're already on a team. You are currently marked as "),o("i",null,u(s.selfLocusInfo.isOnTeam?"on a team":"not on a team"),1),a("! ")]),o("button",{class:"btn btn-sm btn-outline-info mb-2 w-100",onClick:e[1]||(e[1]=t=>s.toggleIsOnTeam(t))},u(s.selfLocusInfo.isOnTeam?'Mark as "not on a team"':'Mark as "on a team"'),1)])]),o("div",Us,[o("div",Cs,[a(" Roles "),Rs,o("div",zs,[m(o("select",{"onUpdate:modelValue":e[2]||(e[2]=t=>s.newRole=t),class:"form-control form-control-sm ml-2"},[Ds,(i(!0),n(g,null,I(s.roleOptions,t=>(i(),n("option",{key:t,value:t,class:"text-capitalize"},u(t),9,Es))),128))],512),[[k,s.newRole]]),o("div",Ps,[s.userRoles.includes(s.newRole)?d("",!0):(i(),n("button",{key:0,disabled:s.userRoles.includes(s.newRole),class:"btn btn-sm btn-outline-success",type:"button",onClick:e[3]||(e[3]=t=>s.updateRole(t))},Ms,8,Ss))]),o("div",Fs,[s.userRoles.includes(s.newRole)?(i(),n("button",{key:0,disabled:!s.userRoles.includes(s.newRole),class:"btn btn-sm btn-outline-danger",type:"button",onClick:e[4]||(e[4]=t=>s.updateRole(t))},qs,8,Ns)):d("",!0)])])])]),Bs,o("div",Ys,[o("div",Ws,[a(" Discord "),Hs,m(o("input",{"onUpdate:modelValue":e[5]||(e[5]=t=>s.newDiscord=t),class:"ml-1 form-control form-control-sm w-100",placeholder:"discord...",maxlength:"40",onChange:e[6]||(e[6]=t=>s.updateDiscord(t))},null,544),[[y,s.newDiscord]])])]),o("div",Gs,[o("div",Js,[a(" Email "),Ks,m(o("input",{"onUpdate:modelValue":e[7]||(e[7]=t=>s.newEmail=t),class:"ml-1 form-control form-control-sm w-100",placeholder:"email...",maxlength:"100",onChange:e[8]||(e[8]=t=>s.updateEmail(t))},null,544),[[y,s.newEmail]])])]),o("div",Qs,[o("div",Xs,[a(" Timezone "),Zs,m(o("select",{"onUpdate:modelValue":e[9]||(e[9]=t=>s.newTimezone=t),class:"form-select form-select-sm w-100 d-inline",onChange:e[10]||(e[10]=t=>s.updateTimezone(t))},[xs,(i(!0),n(g,null,I(s.timezoneOptions,t=>(i(),n("option",{key:t,value:t},u(t)+" UTC ",9,se))),128))],544),[[k,s.newTimezone]])])]),o("div",ee,[o("div",oe,[a(" Availability "),te,m(o("input",{"onUpdate:modelValue":e[11]||(e[11]=t=>s.newAvailability=t),class:"ml-1 form-control form-control-sm w-100",placeholder:"availability...",maxlength:"400",onChange:e[12]||(e[12]=t=>s.updateAvailability(t))},null,544),[[y,s.newAvailability]])])]),o("div",ie,[o("div",ne,[a(" Languages "),le,o("div",ae,[m(o("select",{"onUpdate:modelValue":e[13]||(e[13]=t=>s.newLanguage=t),class:"form-control form-control-sm ml-2"},[ue,(i(!0),n(g,null,I(s.languageOptions,t=>(i(),n("option",{key:t,value:t,class:"text-capitalize"},u(t),9,de))),128))],512),[[k,s.newLanguage]]),o("div",ce,[s.userLanguages.includes(s.newLanguage)?d("",!0):(i(),n("button",{key:0,disabled:s.userLanguages.includes(s.newLanguage),class:"btn btn-sm btn-outline-success",type:"button",onClick:e[14]||(e[14]=t=>s.updateLanguage(t))},fe,8,re))]),o("div",he,[s.userLanguages.includes(s.newLanguage)?(i(),n("button",{key:0,disabled:!s.userLanguages.includes(s.newLanguage),class:"btn btn-sm btn-outline-danger",type:"button",onClick:e[15]||(e[15]=t=>s.updateLanguage(t))},Ie,8,pe)):d("",!0)])])])]),be,o("div",ye,[o("div",ve,[a(" About "),$e,m(o("textarea",{"onUpdate:modelValue":e[16]||(e[16]=t=>s.newAbout=t),length:"4",class:"ml-1 form-control form-control-sm",placeholder:"about...",maxlength:"40000",rows:"4",onChange:e[17]||(e[17]=t=>s.updateAbout(t))},null,544),[[y,s.newAbout]])])])]),s.selfLocusInfo?(i(),n("div",Le,[b(r,{"locus-info":s.selfLocusInfo},null,8,["locus-info"]),o("div",_e,u(s.selfLocusInfo.isPublic?"":"Your info is currently hidden from public display."),1)])):d("",!0)])])]),we])}const Te=$(vs,[["render",ke]]),Ae=v({name:"LocusPage",components:{LocusPageFilters:H,SelfLocusInfo:Te,LocusCard:O},data(){return{userInput:null}},computed:{...h(["loggedInUser"]),...h("locus",["selfLocusInfo"]),...D("locus",["filteredLocusInfos"])},beforeCreate(){this.$store.hasModule("locus")||this.$store.registerModule("locus",M)},async created(){const s=await this.$http.initialRequest("/locus/query");this.$http.isError(s)||(this.$store.commit("locus/setLocusInfos",s.locusInfos),this.$store.commit("locus/setSelfLocusInfo",s.selfLocusInfo))},methods:{}}),Oe=P('<div class="container card card-body py-4 my-4"><h4>Welcome to Locus!</h4><div> Derived from Latin, a <b>locus</b> can be described as &quot;a particular place or position where something of interest occurs&quot;. Locus was conceived as an event that would bring the creative circles in osu! closer together. Beyond simply being a contest, Locus aims to foster positive relationships and champion the communities that shape the very foundation of osu!. </div><div class="mt-2"> Read the <a href="https://osu.ppy.sh/home/news/2025-01-31-locus" target="_blank">news post</a> for an introduction to the contest, and the <a href="https://osu.ppy.sh/wiki/Contests/Locus/2025" target="_blank">wiki article</a> for the nitty gritty details. </div><div class="mt-2"> To discuss anything about Locus, check out the <code>#osu-locus</code> channel in the <a href="https://discord.gg/ppy" target="_blank">osu! Discord server</a>. </div><hr><h5>What is the Nexus?</h5><div> We cannot expect every composer and graphic designer who is interested in participating to be familiar with navigating the osu! community, so the <b>Nexus</b> was created as a support system to help those who are looking to form or join viable teams. </div><ul class="mt-2"><li> Potential participants who are looking to form a team may browse the Nexus to contact someone who they feel is suitable. </li><li> Once a team has been registered, the team member’s bios will be removed from the Nexus. </li></ul></div>',1),Ue={class:"container card card-body mb-2"},Ce=o("h5",{class:"mt-2"},[o("a",{"data-bs-toggle":"collapse",href:"#selfDetails"},[a(" Your details "),o("i",{class:"fas fa-angle-down"})])],-1),Re=o("div",{class:"radial-divisor"},null,-1),ze={class:"container card card-body"},De=o("h4",null,"Potential team members",-1),Ee={class:"row"};function Pe(s,e,l,c,L,_){const r=f("locus-page-filters"),t=f("self-locus-info"),p=f("locus-card");return i(),n("div",null,[Oe,b(r),o("div",Ue,[Ce,b(t,{id:"selfDetails",class:"collapse"})]),Re,o("div",ze,[De,o("div",Ee,[(i(!0),n(g,null,I(s.filteredLocusInfos,w=>(i(),E(p,{key:w.id,"locus-info":w,class:"col-sm-6"},null,8,["locus-info"]))),128))])])])}const Fe=$(Ae,[["render",Pe]]);export{Fe as default};
