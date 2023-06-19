import{d as w,m as _,u as P,_ as k,o as i,e as l,a as s,F as b,r as M,k as c,l as m,b as y,A as $,B as A,i as C,v as E,t as h,h as I,q as g,n as U,s as N,y as T,z as V}from"./index-098c3321.js";const L={namespaced:!0,state:{admins:[],cycles:[],selectedCycleId:null,selectedUser:null,showPhases:!1},mutations:{setAdmins(e,t){e.admins=t},setCycles(e,t){e.cycles=t},removeAdmin(e,t){const o=e.admins.findIndex(d=>d.id==t);o!==-1&&e.admins.splice(o,1)},setSelectedCycleId(e,t){e.selectedCycleId=t},updateCycle(e,t){const o=e.cycles.findIndex(d=>d.id===t.id);o!==-1&&(e.cycles[o]=t)},setSelectedUser(e,t){e.selectedUser=t},toggleShowPhases(e){e.showPhases=!e.showPhases}},getters:{allAdmins:e=>e.admins,allCycles:e=>e.cycles,selectedCycle:e=>e.cycles.find(t=>t.id===e.selectedCycleId)}},D=L,R=w({name:"Administrators",components:{},data(){return{userInput:null,confirmDelete:null}},computed:{..._(["loggedInUser"]),...P("mentorship",["allAdmins"])},beforeCreate(){this.$store.hasModule("mentorship")||this.$store.registerModule("mentorship",D)},methods:{async toggleIsMentorshipAdmin(e,t){const o=await this.$http.executePost("/mentorship/toggleIsMentorshipAdmin",{userInput:this.userInput,userId:t},e);if(!this.$http.isError(o))if(this.$store.dispatch("updateToastMessages",{message:`${o.isMentorshipAdmin?"Added":"Removed"}`,type:"info"}),o.isMentorshipAdmin){const d=[...this.allAdmins];d.push(o),this.$store.commit("mentorship/setAdmins",d)}else this.$store.commit("mentorship/removeAdmin",t)}}}),K={class:"container card card-body py-3"},B=s("h5",null,"Mentorship Administrators",-1),G=s("div",{class:"text-secondary"}," Users with access to mentorship tools: ",-1),z=["onClick"],F=["onClick"],q={class:"input-group w-25"},H={class:"input-group-append"},j=s("i",{class:"fas fa-plus fa-xs"},null,-1),J=[j];function O(e,t,o,d,p,f){const r=C("user-link");return i(),l("div",null,[s("div",K,[B,G,s("ul",null,[(i(!0),l(b,null,M(e.allAdmins,n=>(i(),l("li",{key:n.id},[c(r,{user:n},null,8,["user"]),e.confirmDelete!=n.id?(i(),l("a",{key:0,href:"#",class:"text-danger",onClick:m(a=>e.confirmDelete=n.id,["prevent"])}," delete ",8,z)):(i(),l("a",{key:1,class:"text-danger",href:"#",onClick:m(a=>e.toggleIsMentorshipAdmin(a,n.id),["prevent"])}," confirm ",8,F))]))),128))]),s("div",q,[y(s("input",{"onUpdate:modelValue":t[0]||(t[0]=n=>e.userInput=n),class:"form-control form-control-sm",autocomplete:"off",placeholder:"new admin username/osuId...",onKeyup:t[1]||(t[1]=A(n=>e.toggleIsMentorshipAdmin(n,null),["enter"]))},null,544),[[$,e.userInput,void 0,{number:!0}]]),s("div",H,[s("button",{class:"btn btn-primary",href:"#",onClick:t[2]||(t[2]=m(n=>e.toggleIsMentorshipAdmin(n,null),["prevent"]))},J)])])])])}const Q=k(R,[["render",O]]),W=w({name:"Cycles",data(){return{cycleNumberInput:null,cycleNameInput:null,cycleUrlInput:null,cycleStartInput:null,cycleEndInput:null,duplicateCycleId:""}},computed:{..._(["loggedInUser"]),...P("mentorship",["allCycles"])},beforeCreate(){this.$store.hasModule("mentorship")||this.$store.registerModule("mentorship",D)},methods:{async addCycle(e){if(confirm("Are you sure? Details cannot be changed after adding.")){const o=await this.$http.executePost("/mentorship/addCycle",{number:this.cycleNumberInput,name:this.cycleNameInput,url:this.cycleUrlInput,startDate:this.cycleStartInput,endDate:this.cycleEndInput,duplicateCycleId:this.duplicateCycleId},e);if(!this.$http.isError(o)){this.$store.dispatch("updateToastMessages",{message:`Added "${o.number} - ${o.name}"`,type:"info"});const d=[...this.allCycles];d.unshift(o),this.$store.commit("mentorship/setCycles",d)}}}}}),X={class:"container card card-body py-3 mb-2"},Y=s("h5",null,"New cycle",-1),Z=s("div",{class:"text-secondary"}," Add a new cycle based on input below. ",-1),x=s("div",{class:"text-secondary"}," To copy relationships from an existing cycle, select the cycle in the dropdown. ",-1),ee={class:"row"},te={class:"col-sm-6 mb-2"},se=s("option",{value:"",selected:"",disabled:""}," Select a cycle to duplicate ",-1),oe=["value"],ne={class:"input-group mt-2"},re={class:"input-group-append"},ie=s("i",{class:"fas fa-plus fa-xs"},null,-1),le=[ie];function de(e,t,o,d,p,f){return i(),l("div",null,[s("div",X,[Y,Z,x,s("div",ee,[s("div",te,[y(s("select",{"onUpdate:modelValue":t[0]||(t[0]=r=>e.duplicateCycleId=r),class:"form-select form-select d-inline"},[se,(i(!0),l(b,null,M(e.allCycles,r=>(i(),l("option",{key:r.id,value:r.id},h(r.number)+" - "+h(r.name),9,oe))),128))],512),[[E,e.duplicateCycleId]])])]),s("div",ne,[y(s("input",{"onUpdate:modelValue":t[1]||(t[1]=r=>e.cycleNumberInput=r),class:"form-control form-control-sm",autocomplete:"off",type:"number",placeholder:"new cycle number..."},null,512),[[$,e.cycleNumberInput,void 0,{number:!0}]]),y(s("input",{"onUpdate:modelValue":t[2]||(t[2]=r=>e.cycleNameInput=r),class:"form-control form-control-sm",autocomplete:"off",placeholder:"new cycle name..."},null,512),[[$,e.cycleNameInput,void 0,{number:!0}]]),y(s("input",{"onUpdate:modelValue":t[3]||(t[3]=r=>e.cycleUrlInput=r),class:"form-control form-control-sm",autocomplete:"off",placeholder:"cycle details link..."},null,512),[[$,e.cycleUrlInput,void 0,{number:!0}]]),y(s("input",{"onUpdate:modelValue":t[4]||(t[4]=r=>e.cycleStartInput=r),class:"form-control form-control-sm",type:"date"},null,512),[[$,e.cycleStartInput]]),y(s("input",{"onUpdate:modelValue":t[5]||(t[5]=r=>e.cycleEndInput=r),class:"form-control form-control-sm",type:"date"},null,512),[[$,e.cycleEndInput]]),s("div",re,[s("button",{class:"btn btn-primary",href:"#",onClick:t[6]||(t[6]=m(r=>e.addCycle(r),["prevent"]))},le)])])])])}const ae=k(W,[["render",de]]),ce=w({name:"ParticipantList",props:{mode:{type:String,default:""}},data(){return{mentorInput:null,menteeInput:null,editingMentorId:"",confirmDeleteMentor:"",confirmDeleteMentee:"",phaseEdit:!1}},computed:{..._(["loggedInUser"]),..._("mentorship",["showPhases"]),...P("mentorship",["selectedCycle"]),modeMentors(){return this.selectedCycle.participants.filter(t=>{for(const o of t.mentorships)if(o.mode==this.mode&&o.group=="mentor"&&o.cycle.toString()==this.selectedCycle.id)return!0}).sort((t,o)=>t.username.toLowerCase()>o.username.toLowerCase()?1:o.username.toLowerCase()>t.username.toLowerCase()?-1:0)},modeMentees(){return this.selectedCycle.participants.filter(t=>{for(const o of t.mentorships)if(o.mode==this.mode&&o.group=="mentee"&&o.cycle.toString()==this.selectedCycle.id)return!0}).sort((t,o)=>t.username.toLowerCase()>o.username.toLowerCase()?1:o.username.toLowerCase()>t.username.toLowerCase()?-1:0)},title(){return this.mode=="modding"||this.mode=="graduation"||this.mode=="storyboard"?this.mode:this.mode=="osu"?"osu!":"osu!"+this.mode}},beforeCreate(){this.$store.hasModule("mentorship")||this.$store.registerModule("mentorship",D)},methods:{findMentees(e){return this.modeMentees.filter(o=>{for(const d of o.mentorships)if(d.group=="mentee"&&d.mentor.toString()==e&&d.cycle.toString()==this.selectedCycle.id)return!0})},isPhaseParticipant(e,t,o){return!!e.mentorships.find(p=>p.cycle.toString()==this.selectedCycle.id&&p.mode==this.mode&&(p.mentor?p.mentor.toString()==o:o==e.id)).phases.includes(t)},involvedInAllPhases(e){return e.mentorships.find(o=>o.cycle.toString()==this.selectedCycle.id&&o.mode==this.mode).phases.length==3},async addMentor(e){const t=await this.$http.executePost("/mentorship/addMentor",{cycleId:this.selectedCycle.id,userInput:this.mentorInput,mode:this.mode},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:`Added "${this.mentorInput}"`,type:"info"}),this.$store.commit("mentorship/updateCycle",t),this.mentorInput=null)},async addMentee(e,t){const o=await this.$http.executePost("/mentorship/addMentee",{cycleId:this.selectedCycle.id,userInput:this.menteeInput,mode:this.mode,mentorId:t},e);this.$http.isError(o)||(this.$store.dispatch("updateToastMessages",{message:`Added "${this.menteeInput}"`,type:"info"}),this.$store.commit("mentorship/updateCycle",o),this.menteeInput=null,this.editingMentorId="")},async removeParticipant(e,t){const o=await this.$http.executePost("/mentorship/removeParticipant",{cycleId:this.selectedCycle.id,userId:t,mode:this.mode},e);this.$http.isError(o)||(this.$store.dispatch("updateToastMessages",{message:"Removed user",type:"info"}),this.$store.commit("mentorship/updateCycle",o),this.confirmDeleteMentee="",this.confirmDeleteMentor="")},async togglePhase(e,t,o){this.phaseEdit=!0;const d=await this.$http.executePost("/mentorship/togglePhase",{cycleId:this.selectedCycle.id,userId:e.id,mode:this.mode,phaseNum:t,mentorId:o});this.$http.isError(d)||(this.$store.dispatch("updateToastMessages",{message:`Toggled phase ${t} for ${e.username}`,type:"info"}),this.$store.commit("mentorship/updateCycle",d)),this.phaseEdit=!1}}});const S=e=>(T("data-v-4a1dde50"),e=e(),V(),e),ue={class:"col-sm-3"},pe={key:0,class:"text-secondary"},me=["onClick"],he=S(()=>s("i",{class:"fas fa-plus"},null,-1)),ye=[he],fe={key:1},$e=["onClick"],ge=S(()=>s("i",{class:"fas fa-minus"},null,-1)),ve=[ge],Ce=["onClick"],Ie={key:2,class:"small"},_e=["onClick"],be={key:0,class:"text-secondary"},Me=["onClick"],we=S(()=>s("i",{class:"fas fa-minus"},null,-1)),ke=[we],De=["onClick"],Ue={key:3,class:"small"},Pe=["onClick"],Se={key:3,class:"input-group"},Ae=["onKeyup"],Ee={class:"input-group-append"},Ne=["onClick"],Te=S(()=>s("i",{class:"fas fa-plus fa-xs"},null,-1)),Ve=[Te],Le={class:"input-group mb-3"},Re={class:"input-group-append"},Ke=S(()=>s("i",{class:"fas fa-plus fa-xs"},null,-1)),Be=[Ke];function Ge(e,t,o,d,p,f){const r=C("user-link"),n=N("bs-tooltip");return i(),l("div",ue,[s("h5",null,h(e.title),1),s("ol",null,[(i(!0),l(b,null,M(e.modeMentors,a=>(i(),l("li",{key:a.id+e.mode},[c(r,{user:a},null,8,["user"]),e.involvedInAllPhases(a)?g("",!0):y((i(),l("span",pe,[I("*")])),[[n,"skips phases"]]),s("a",{href:"#",class:"text-success ms-1 small",onClick:m(u=>e.editingMentorId=a.id,["prevent"])},ye,8,me),e.findMentees(a.id).length?g("",!0):(i(),l("span",fe,[e.confirmDeleteMentor!=a.id?(i(),l("a",{key:0,href:"#",class:"text-danger ms-1 small",onClick:m(u=>e.confirmDeleteMentor=a.id,["prevent"])},ve,8,$e)):(i(),l("a",{key:1,class:"text-danger",href:"#",onClick:m(u=>e.removeParticipant(u,a.id),["prevent"])}," confirm ",8,Ce))])),e.showPhases?(i(),l("span",Ie,[(i(),l(b,null,M(3,u=>s("a",{key:u,href:"#",class:U(e.phaseEdit?"fake-button-disable":""),onClick:m(v=>e.togglePhase(a,u,null),["prevent"])},[s("span",{class:U([e.isPhaseParticipant(a,u,a.id)?"":"text-danger","ms-1"])},"P"+h(u),3)],10,_e)),64))])):g("",!0),s("ul",null,[(i(!0),l(b,null,M(e.findMentees(a.id),u=>(i(),l("li",{key:u.id+e.mode,class:"small"},[c(r,{user:u},null,8,["user"]),e.involvedInAllPhases(u)?g("",!0):y((i(),l("span",be,[I("*")])),[[n,"skips phases"]]),e.confirmDeleteMentee!=u.id?(i(),l("a",{key:1,href:"#",class:"text-danger ms-1 small",onClick:m(v=>e.confirmDeleteMentee=u.id,["prevent"])},ke,8,Me)):(i(),l("a",{key:2,class:"text-danger",href:"#",onClick:m(v=>e.removeParticipant(v,u.id),["prevent"])}," confirm ",8,De)),e.showPhases?(i(),l("span",Ue,[(i(),l(b,null,M(3,v=>s("a",{key:v,href:"#",class:U(e.phaseEdit?"fake-button-disable":""),onClick:m(us=>e.togglePhase(u,v,a.id),["prevent"])},[s("span",{class:U([e.isPhaseParticipant(u,v,a.id)?"":"text-danger","ms-1"])},"P"+h(v),3)],10,Pe)),64))])):g("",!0)]))),128))]),e.editingMentorId==a.id?(i(),l("div",Se,[y(s("input",{"onUpdate:modelValue":t[0]||(t[0]=u=>e.menteeInput=u),class:"form-control form-control-sm ms-2",autocomplete:"off",placeholder:"new mentee username/osuId...",onKeyup:A(u=>e.addMentee(u,a.id),["enter"])},null,40,Ae),[[$,e.menteeInput]]),s("div",Ee,[s("button",{class:"btn btn-primary",href:"#",onClick:m(u=>e.addMentee(u,a.id),["prevent"])},Ve,8,Ne)])])):g("",!0)]))),128))]),s("div",Le,[y(s("input",{"onUpdate:modelValue":t[1]||(t[1]=a=>e.mentorInput=a),class:"form-control form-control-sm",autocomplete:"off",placeholder:"new mentor username/osuId...",onKeyup:t[2]||(t[2]=A(a=>e.addMentor(a),["enter"]))},null,544),[[$,e.mentorInput]]),s("div",Re,[s("button",{class:"btn btn-primary",href:"#",onClick:t[3]||(t[3]=m(a=>e.addMentor(a),["prevent"]))},Be)])])])}const ze=k(ce,[["render",Ge],["__scopeId","data-v-4a1dde50"]]),Fe=w({name:"Participants",components:{ParticipantList:ze},data(){return{cycleId:"",showCycleInputs:!1,cycleNameInput:null,cycleNumberInput:null,cycleUrlInput:null,cycleStartDateInput:new Date,cycleEndDateInput:new Date}},computed:{..._(["loggedInUser"]),..._("mentorship",["showPhases"]),...P("mentorship",["allCycles","selectedCycle"])},watch:{cycleId(){this.$store.commit("mentorship/setSelectedCycleId",this.cycleId),this.cycleNameInput=this.selectedCycle.name,this.cycleNumberInput=this.selectedCycle.number,this.cycleUrlInput=this.selectedCycle.url,this.cycleStartDateInput=new Date(this.selectedCycle.startDate),this.cycleEndDateInput=new Date(this.selectedCycle.endDate)}},beforeCreate(){this.$store.hasModule("mentorship")||this.$store.registerModule("mentorship",D)},methods:{toggleShowPhases(){this.$store.commit("mentorship/toggleShowPhases")},async updateCycleName(e){const t=await this.$http.executePost("/mentorship/updateCycleName",{cycleId:this.selectedCycle.id,name:this.cycleNameInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"Updated cycle name",type:"info"}),this.$store.commit("mentorship/updateCycle",t))},async updateCycleNumber(e){const t=await this.$http.executePost("/mentorship/updateCycleNumber",{cycleId:this.selectedCycle.id,number:this.cycleNumberInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"Updated cycle number",type:"info"}),this.$store.commit("mentorship/updateCycle",t))},async updateCycleUrl(e){const t=await this.$http.executePost("/mentorship/updateCycleUrl",{cycleId:this.selectedCycle.id,url:this.cycleUrlInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"Updated cycle url",type:"info"}),this.$store.commit("mentorship/updateCycle",t))},async updateCycleStartDate(e){console.log(this.cycleStartDateInput);const t=await this.$http.executePost("/mentorship/updateCycleStartDate",{cycleId:this.selectedCycle.id,startDate:this.cycleStartDateInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"Updated cycle start date",type:"info"}),this.$store.commit("mentorship/updateCycle",t))},async updateCycleEndDate(e){const t=await this.$http.executePost("/mentorship/updateCycleEndDate",{cycleId:this.selectedCycle.id,endDate:this.cycleEndDateInput},e);this.$http.isError(t)||(this.$store.dispatch("updateToastMessages",{message:"Updated cycle end date",type:"info"}),this.$store.commit("mentorship/updateCycle",t))}}}),qe={class:"container card card-body py-3 mb-2"},He={class:"row"},je={class:"col-sm-6 mb-2"},Je=s("option",{value:"",selected:"",disabled:""}," Select a cycle ",-1),Oe=["value"],Qe={key:0},We=s("hr",null,null,-1),Xe={key:0,class:"mb-4"},Ye={class:"row"},Ze=s("div",{class:"col-sm-2"}," Cycle name: ",-1),xe={class:"col-sm-4 mb-2"},et={class:"input-group"},tt={class:"input-group-append"},st={class:"row"},ot=s("div",{class:"col-sm-2"}," Cycle number: ",-1),nt={class:"col-sm-4 mb-2"},rt={class:"input-group"},it={class:"input-group-append"},lt={class:"row"},dt=s("div",{class:"col-sm-2"}," Cycle url: ",-1),at={class:"col-sm-4 mb-2"},ct={class:"input-group"},ut={class:"input-group-append"},pt={class:"row"},mt=s("div",{class:"col-sm-2"}," Cycle start date: ",-1),ht={class:"col-sm-4 mb-2"},yt={class:"input-group"},ft={class:"input-group-append"},$t={class:"row"},gt=s("div",{class:"col-sm-2"}," Cycle end date: ",-1),vt={class:"col-sm-4 mb-2"},Ct={class:"input-group"},It={class:"input-group-append"},_t={key:1},bt={key:0,class:"fas fa-edit"},Mt={class:"text-secondary small"},wt={class:"row"};function kt(e,t,o,d,p,f){const r=C("participant-list");return i(),l("div",null,[s("div",qe,[s("div",He,[s("div",je,[y(s("select",{"onUpdate:modelValue":t[0]||(t[0]=n=>e.cycleId=n),class:"form-select form-select d-inline"},[Je,(i(!0),l(b,null,M(e.allCycles,n=>(i(),l("option",{key:n.id,value:n.id},h(n.number)+" - "+h(n.name),9,Oe))),128))],512),[[E,e.cycleId]])])]),e.selectedCycle?(i(),l("div",Qe,[We,e.showCycleInputs?(i(),l("div",Xe,[s("div",Ye,[Ze,s("div",xe,[s("div",et,[y(s("input",{"onUpdate:modelValue":t[1]||(t[1]=n=>e.cycleNameInput=n),class:"form-control form-control-sm",autocomplete:"off",placeholder:"cycle name..."},null,512),[[$,e.cycleNameInput]]),s("div",tt,[s("button",{class:"btn btn-primary",href:"#",onClick:t[2]||(t[2]=m(n=>e.updateCycleName(n),["prevent"]))}," save ")])])])]),s("div",st,[ot,s("div",nt,[s("div",rt,[y(s("input",{"onUpdate:modelValue":t[3]||(t[3]=n=>e.cycleNumberInput=n),class:"form-control form-control-sm",autocomplete:"off",type:"number",placeholder:"cycle number..."},null,512),[[$,e.cycleNumberInput,void 0,{number:!0}]]),s("div",it,[s("button",{class:"btn btn-primary",href:"#",onClick:t[4]||(t[4]=m(n=>e.updateCycleNumber(n),["prevent"]))}," save ")])])])]),s("div",lt,[dt,s("div",at,[s("div",ct,[y(s("input",{"onUpdate:modelValue":t[5]||(t[5]=n=>e.cycleUrlInput=n),class:"form-control form-control-sm",autocomplete:"off",placeholder:"cycle url..."},null,512),[[$,e.cycleUrlInput]]),s("div",ut,[s("button",{class:"btn btn-primary",href:"#",onClick:t[6]||(t[6]=m(n=>e.updateCycleUrl(n),["prevent"]))}," save ")])])])]),s("div",pt,[mt,s("div",ht,[s("div",yt,[y(s("input",{"onUpdate:modelValue":t[7]||(t[7]=n=>e.cycleStartDateInput=n),class:"form-control form-control-sm",type:"date",placeholder:"cycle start date..."},null,512),[[$,e.cycleStartDateInput]]),s("div",ft,[s("button",{class:"btn btn-primary",href:"#",onClick:t[8]||(t[8]=m(n=>e.updateCycleStartDate(n),["prevent"]))}," save ")])])])]),s("div",$t,[gt,s("div",vt,[s("div",Ct,[y(s("input",{"onUpdate:modelValue":t[9]||(t[9]=n=>e.cycleEndDateInput=n),class:"form-control form-control-sm",type:"date",placeholder:"cycle end date..."},null,512),[[$,e.cycleEndDateInput]]),s("div",It,[s("button",{class:"btn btn-primary",href:"#",onClick:t[10]||(t[10]=m(n=>e.updateCycleEndDate(n),["prevent"]))}," save ")])])])]),s("a",{href:"#",onClick:t[11]||(t[11]=m(n=>e.showCycleInputs=!e.showCycleInputs,["prevent"]))}," stop editing (close without saving) ")])):(i(),l("h4",_t,[I(h(e.selectedCycle.name)+" ",1),s("a",{href:"#",onClick:t[12]||(t[12]=m(n=>e.showCycleInputs=!e.showCycleInputs,["prevent"]))},[I(h(e.showCycleInputs?"close":"")+" ",1),e.showCycleInputs?g("",!0):(i(),l("i",bt))])])),s("h5",Mt,h(e.selectedCycle.startDate.slice(0,10))+" - "+h(e.selectedCycle.endDate.slice(0,10)),1),s("button",{class:"btn btn-sm btn-outline-info mb-2",onClick:t[13]||(t[13]=n=>e.toggleShowPhases())},h(e.showPhases?"Hide":"Show")+" phases ",1),s("div",null,[s("div",wt,[c(r,{mode:"osu"}),c(r,{mode:"taiko"}),c(r,{mode:"catch"}),c(r,{mode:"mania"}),c(r,{mode:"modding"}),c(r,{mode:"graduation"}),c(r,{mode:"storyboard"})])])])):g("",!0)])])}const Dt=k(Fe,[["render",kt]]),Ut=w({name:"CycleList",props:{mode:{type:String,default:""},group:{type:String,default:""}},computed:{..._("mentorship",["selectedUser"]),modeMentorships(){return this.selectedUser.mentorships?this.selectedUser.mentorships.filter(e=>{if(e.group==this.group&&e.mode==this.mode)return!0}):[]},mentorshipsToPhases(){if(this.modeMentorships.length){let e=0;for(const t of this.modeMentorships)t.phases.length&&(e+=t.phases.length/3);return Math.round(e*100)/100}return 0},modeDuration(){return this.calculateDuration(this.modeMentorships)},title(){return this.mode=="modding"||this.mode=="graduation"||this.mode=="storyboard"?this.mode:this.mode=="osu"?"osu!":"osu!"+this.mode}},methods:{calculateDuration(e){let t=0;for(const o of e)if(new Date>new Date(o.cycle.endDate)){const d=new Date(o.cycle.endDate).getTime()-new Date(o.cycle.startDate).getTime(),p=Math.round(d*(o.phases.length/3)/(1e3*60*60*24));t+=p}return t},findRelevantMentees(e){return this.selectedUser.mentees.filter(t=>{for(const o of t.mentorships)if(o.cycle.toString()==e&&o.group=="mentee"&&o.mode==this.mode&&o.mentor.toString()==this.selectedUser.id)return!0})}}}),Pt={class:"col-sm-3"},St={class:"text-center"},At=["href"],Et={class:"small text-secondary"},Nt={key:0},Tt={class:"small text-secondary"},Vt={key:1};function Lt(e,t,o,d,p,f){const r=C("user-link");return i(),l("div",Pt,[s("div",St,[s("b",{class:U(e.modeMentorships.length>=4&&e.group=="mentee"?"text-danger":"")},h(e.title)+" "+h(e.group)+" cycles ("+h(e.mentorshipsToPhases)+")",3)]),s("ul",null,[(i(!0),l(b,null,M(e.modeMentorships,n=>(i(),l("li",{key:n.id+e.mode},[s("a",{href:n.cycle.url,target:"_blank"},h(n.cycle.number)+": "+h(n.cycle.name),9,At),s("span",Et," ("+h(e.calculateDuration([n]))+" days) ",1),n.mentor?(i(),l("ul",Nt,[s("li",Tt,[I(" mentored by "),c(r,{user:n.mentor},null,8,["user"])])])):g("",!0),e.group=="mentor"&&e.findRelevantMentees(n.cycle.id).length?(i(),l("ul",Vt,[(i(!0),l(b,null,M(e.findRelevantMentees(n.cycle.id),a=>(i(),l("li",{key:a.id+e.mode+n.cycle.id,class:"small text-secondary"},[I(" mentor of "),c(r,{user:a},null,8,["user"])]))),128))])):g("",!0)]))),128))])])}const Rt=k(Ut,[["render",Lt]]),Kt=w({name:"UserDetails",components:{CycleList:Rt},data(){return{userInput:""}},computed:{..._("mentorship",["selectedUser"]),totalMentorDuration(){const t=this.selectedUser.mentorships.filter(f=>{if(f.group=="mentor")return!0}).reduce((f,r)=>(f.some(n=>n.cycle.id===r.cycle.id)||f.push(r),f),[]),o=this.calculateDuration(t);let d=Math.floor(o/365),p=Math.round(o%365);return d>0?`${d} ${d==1?"year":"years"} and ${p} days`:`${p} days`},totalMenteeDuration(){const t=this.selectedUser.mentorships.filter(f=>{if(f.group=="mentee")return!0}).reduce((f,r)=>(f.some(n=>n.cycle.id===r.cycle.id)||f.push(r),f),[]),o=this.calculateDuration(t);let d=Math.floor(o/365),p=Math.round(o%365);return d>0?`${d} ${d==1?"year":"years"}, ${p} days`:`${p} days`}},beforeCreate(){this.$store.hasModule("mentorship")||this.$store.registerModule("mentorship",D)},methods:{async searchUser(e){const t=await this.$http.executeGet("/mentorship/searchUser/"+this.userInput,e);this.$http.isError(t)||this.$store.commit("mentorship/setSelectedUser",t)},calculateDuration(e){let t=0;for(const o of e)if(new Date>new Date(o.cycle.endDate)){const d=new Date(o.cycle.endDate).getTime()-new Date(o.cycle.startDate).getTime(),p=Math.round(d*(o.phases.length/3)/(1e3*60*60*24));t+=p}return t}}}),Bt={class:"container card card-body py-3"},Gt=s("h5",null,"User Details",-1),zt=s("div",{class:"text-secondary mb-2"}," View a user's mentorship history ",-1),Ft={class:"input-group w-25"},qt={class:"input-group-append"},Ht=s("i",{class:"fas fa-search fa-xs"},null,-1),jt=[Ht],Jt={key:0},Ot={class:"mt-2"},Qt={class:"row mt-2"},Wt={class:"row mt-2"};function Xt(e,t,o,d,p,f){const r=C("cycle-list");return i(),l("div",null,[s("div",Bt,[Gt,zt,s("div",Ft,[y(s("input",{"onUpdate:modelValue":t[0]||(t[0]=n=>e.userInput=n),class:"form-control form-control-sm",autocomplete:"off",placeholder:"username/osuId...",onKeyup:t[1]||(t[1]=A(n=>e.searchUser(n),["enter"]))},null,544),[[$,e.userInput]]),s("div",qt,[s("button",{class:"btn btn-primary",href:"#",onClick:t[2]||(t[2]=m(n=>e.searchUser(n),["prevent"]))},jt)])]),e.selectedUser?(i(),l("div",Jt,[s("div",Ot,[I(" Mentor for "),s("b",null,h(e.totalMentorDuration),1),I(" across all cycles and game modes ")]),s("div",Qt,[c(r,{mode:"osu",group:"mentor"}),c(r,{mode:"taiko",group:"mentor"}),c(r,{mode:"catch",group:"mentor"}),c(r,{mode:"mania",group:"mentor"}),c(r,{mode:"modding",group:"mentor"}),c(r,{mode:"graduation",group:"mentor"}),c(r,{mode:"storyboard",group:"mentor"})]),s("div",null,[I(" Mentee for "),s("b",null,h(e.totalMenteeDuration),1),I(" across all cycles and game modes ")]),s("div",Wt,[c(r,{mode:"osu",group:"mentee"}),c(r,{mode:"taiko",group:"mentee"}),c(r,{mode:"catch",group:"mentee"}),c(r,{mode:"mania",group:"mentee"}),c(r,{mode:"modding",group:"mentee"}),c(r,{mode:"graduation",group:"mentee"}),c(r,{mode:"storyboard",group:"mentee"})])])):g("",!0)])])}const Yt=k(Kt,[["render",Xt]]),Zt=w({name:"AddRestrictedUser",components:{},data(){return{usernameInput:null,osuIdInput:null}},computed:{..._(["loggedInUser"])},beforeCreate(){this.$store.hasModule("mentorship")||this.$store.registerModule("mentorship",D)},methods:{async addRestrictedUser(e){const t=await this.$http.executePost("/mentorship/addRestrictedUser",{usernameInput:this.usernameInput,osuIdInput:this.osuIdInput},e);this.$http.isError(t)||this.$store.dispatch("updateToastMessages",{message:`Added ${t.username}`,type:"info"})}}}),xt={class:"container card card-body py-3"},es=s("h5",null,"Add restricted user",-1),ts=s("div",{class:"text-secondary"}," This adds a user to the Mappers' Guild database manually. Ensure name and osu ID are correct. If they're not, there will be problems if the user is unrestricted. ",-1),ss={class:"input-group w-50"},os={class:"input-group-append"},ns=s("i",{class:"fas fa-plus fa-xs"},null,-1),rs=[ns];function is(e,t,o,d,p,f){return i(),l("div",null,[s("div",xt,[es,ts,s("div",ss,[y(s("input",{"onUpdate:modelValue":t[0]||(t[0]=r=>e.usernameInput=r),class:"form-control form-control-sm",autocomplete:"off",placeholder:"username..."},null,512),[[$,e.usernameInput,void 0,{number:!0}]]),y(s("input",{"onUpdate:modelValue":t[1]||(t[1]=r=>e.osuIdInput=r),class:"form-control form-control-sm",autocomplete:"off",placeholder:"osuId..."},null,512),[[$,e.osuIdInput,void 0,{number:!0}]]),s("div",os,[s("button",{class:"btn btn-primary",href:"#",onClick:t[2]||(t[2]=m(r=>e.addRestrictedUser(r),["prevent"]))},rs)])])])])}const ls=k(Zt,[["render",is]]),ds=w({name:"MentorshipPage",components:{Administrators:Q,Cycles:ae,Participants:Dt,UserDetails:Yt,AddRestrictedUser:ls},data(){return{userInput:null,confirmDelete:null}},computed:{..._(["loggedInUser"]),...P("mentorship",["allCycles"])},beforeCreate(){this.$store.hasModule("mentorship")||this.$store.registerModule("mentorship",D)},async created(){const e=await this.$http.initialRequest("/mentorship/query");this.$http.isError(e)||(this.$store.commit("mentorship/setAdmins",e.admins),this.$store.commit("mentorship/setCycles",e.cycles))},methods:{}}),as=s("hr",null,null,-1);function cs(e,t,o,d,p,f){const r=C("participants"),n=C("user-details"),a=C("cycles"),u=C("administrators"),v=C("add-restricted-user");return i(),l("div",null,[c(r),c(n),as,c(a),c(u),c(v)])}const ms=k(ds,[["render",cs]]);export{ms as default};
