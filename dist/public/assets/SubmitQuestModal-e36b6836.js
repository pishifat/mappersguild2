import{d as h,_ as f,o,e as l,a as i,t as m,L as _,q as p,c as g,w as c,i as d,r as q,F as V,m as A,k as r,h as v,l as S}from"./index-6722cfe1.js";import{M}from"./ModalDialog-fb1e108c.js";const Q=h({name:"FormFieldBase",props:{label:{type:String,required:!0},description:{type:String,default:""}}}),F={class:"mb-3 row"},N={class:"col-sm-3 col-form-label"},j={class:"col-sm-9"},I={key:0,class:"text-secondary small"};function T(e,t,n,b,y,$){return o(),l("div",F,[i("div",N,[i("b",null,m(e.label),1)]),i("div",j,[_(e.$slots,"default"),e.description?(o(),l("p",I,m(e.description),1)):p("",!0)])])}const k=f(Q,[["render",T]]),O=h({name:"FormField",components:{FormFieldBase:k},props:{label:{type:String,required:!0},placeholder:{type:String,default:""},modelValue:{type:[String,Number],required:!0},type:{type:String,default:"text"},description:{type:String,default:""}},emits:["update:modelValue"]}),U=["value","type","placeholder"];function B(e,t,n,b,y,$){const u=d("form-field-base");return o(),g(u,{label:e.label,description:e.description},{default:c(()=>[i("input",{value:e.modelValue,type:e.type,placeholder:e.placeholder,class:"form-control form-control-sm",autocomplete:"off",onInput:t[0]||(t[0]=a=>e.$emit("update:modelValue",a.target.value))},null,40,U)]),_:1},8,["label","description"])}const R=f(O,[["render",B]]),L=h({name:"FormField",components:{FormFieldBase:k},props:{label:{type:String,required:!0},placeholder:{type:String,default:""},modelValue:{type:String,required:!0},rows:{type:Number,default:3}},emits:["update:modelValue"]}),D=["value","rows","placeholder"];function z(e,t,n,b,y,$){const u=d("form-field-base");return o(),g(u,{label:e.label},{default:c(()=>[i("textarea",{value:e.modelValue,class:"form-control form-control-sm",rows:e.rows,placeholder:e.placeholder,onInput:t[0]||(t[0]=a=>e.$emit("update:modelValue",a.target.value))},null,40,D)]),_:1},8,["label"])}const E=f(L,[["render",z]]),G=h({name:"FormField",components:{FormFieldBase:k},props:{label:{type:String,required:!0},placeholder:{type:String,default:"..."},modelValue:{type:String,required:!0},type:{type:String,default:"text"},options:{type:Array,default:()=>[]}},emits:["update:modelValue"]}),K={value:"",selected:""},Y=["value","selected"];function H(e,t,n,b,y,$){const u=d("form-field-base");return o(),g(u,{label:e.label},{default:c(()=>[i("select",{class:"form-select form-select-sm",onInput:t[0]||(t[0]=a=>e.$emit("update:modelValue",a.target.value))},[i("option",K,m(e.placeholder),1),_(e.$slots,"default",{},()=>[(o(!0),l(V,null,q(e.options,(a,C)=>(o(),l("option",{key:C,value:a,selected:a===e.modelValue},m(a),9,Y))),128))])],32)]),_:3},8,["label"])}const J=f(G,[["render",H]]),W=h({name:"FormCheckbox",components:{FormFieldBase:k},props:{id:{type:String,required:!0},label:{type:String,required:!0},info:{type:String,default:""},modelValue:Boolean},emits:["update:modelValue"]}),X={class:"form-check"},Z=["id","checked"],x=["for"];function ee(e,t,n,b,y,$){const u=d("form-field-base");return o(),g(u,{label:e.label},{default:c(()=>[i("div",X,[i("input",{id:e.id,class:"form-check-input",type:"checkbox",checked:e.modelValue,onChange:t[0]||(t[0]=a=>e.$emit("update:modelValue",a.target.checked))},null,40,Z),i("label",{class:"form-check-label",for:e.id},m(e.info),9,x)])]),_:1},8,["label"])}const te=f(W,[["render",ee]]),se=h({name:"SubmitQuestModal",components:{ModalDialog:M,FormInput:R,FormTextarea:E,FormSelect:J,FormCheckbox:te},props:{isAdmin:Boolean},data(){return{featuredArtists:[],selectedArtist:"",mapsetCount:6,name:"",price:0,objective:"",timeframe:0,minParty:0,maxParty:0,minRank:0,isMbc:!1,queuedQuests:[]}},computed:{...A(["loggedInUser"]),packType(){return this.mapsetCount==1?"single":this.mapsetCount==2?"double":this.mapsetCount<=4?"mini-pack":this.mapsetCount<=9?"pack":this.mapsetCount>=10?"mega-pack":"invalid-pack"},selectedArtistOsuId(){return this.selectedArtist.length?this.selectedArtist.split("|")[0]:""},selectedArtistName(){return this.selectedArtist.length?this.selectedArtist.split("|")[1]:""},points(){let e=25;return this.selectedArtist||(e+=10),this.mapsetCount<1?e=727:this.mapsetCount==1?e+=100:this.mapsetCount<10&&(e+=(10-this.mapsetCount)*7.5),e},enoughPoints(){return this.loggedInUser.availablePoints-this.points>0}},watch:{selectedArtist(){this.selectedArtistName.length&&this.mapsetCount>0&&(this.name=this.findName(),this.objective=this.findObjective(),this.price=this.findPrice(),this.timeframe=this.findTimeframe(),this.minParty=this.mapsetCount,this.maxParty=this.mapsetCount*3)},mapsetCount(){this.selectedArtistName.length&&this.mapsetCount>0&&(this.name=this.findName(),this.objective=this.findObjective(),this.price=this.findPrice(),this.timeframe=this.findTimeframe(),this.minParty=this.mapsetCount,this.maxParty=this.mapsetCount*3)}},async created(){const e=await this.$http.executeGet("/featuredArtists");e&&(this.featuredArtists=e.sort((t,n)=>t.label.toLowerCase()>n.label.toLowerCase()?1:n.label.toLowerCase()>t.label.toLowerCase()?-1:0))},methods:{findName(){return this.selectedArtistName+" "+this.packType},findObjective(){return this.mapsetCount==1?`Create and rank ${this.mapsetCount} mapset of any song by ${this.selectedArtistName}.`:`Create and rank at least ${this.mapsetCount} mapsets of songs by ${this.selectedArtistName}, each hosted by a different user.`},findPrice(){switch(this.mapsetCount){case 1:return 20;case 2:return 10;case 3:return 5;default:return 0}},findTimeframe(){return this.mapsetCount*10+70},resetQuestDetails(){this.selectedArtist="",this.mapsetCount=6,this.name="",this.price=0,this.objective="",this.timeframe=0,this.minParty=0,this.maxParty=0,this.minRank=0,this.isMbc=!1},addToQueue(){this.queuedQuests.push({name:this.name,price:this.price,descriptionMain:this.objective,timeframe:this.timeframe*(24*3600*1e3),minParty:this.minParty,maxParty:this.maxParty,minRank:this.minRank,isMbc:this.isMbc,art:parseInt(this.selectedArtistOsuId),requiredMapsets:this.mapsetCount}),this.resetQuestDetails()},removeFromQueue(e){this.queuedQuests=this.queuedQuests.filter(t=>t.name!=e)},async submitQuest(e){const t={name:this.name,price:this.price,descriptionMain:this.objective,timeframe:this.timeframe*864e5,minParty:this.minParty,maxParty:this.maxParty,art:this.selectedArtistOsuId,requiredMapsets:this.mapsetCount},n=await this.$http.executePost("/quests/submit",t,e);this.$http.isError(n)||(this.$bs.hideModal("submitQuest"),this.resetQuestDetails())},async scheduleQuests(e){const t={quests:this.queuedQuests},n=await this.$http.executePost("/admin/quests/create",t,e);this.$http.isError(n)||(this.$bs.hideModal("submitQuest"),this.queuedQuests=[])}}}),ie={class:"container"},oe=i("option",{value:"-",disabled:""}," --- ",-1),ae=["value"],le={key:0,class:"row col ms-4"},ne=i("ul",{class:"small text-secondary"},[i("li",null,"This artist's logo will be used as the quest's icon."),i("li",null,"If your quest allows songs from a few artists, choose whichever best expresses its theme."),i("li",null,'If your quest allows songs from many artists, choose "No specific artist".'),i("li",null,'Selecting an artist pre-fills the "Name" and "Objective" fields, though these can still be customized.')],-1),re=[ne],ue={key:1,class:"row col ms-4"},de=i("ul",{class:"small text-secondary"},[i("li",null,"Submitting quest for approval requires you to spend points correlating to how many mapsets are required. The fewer required mapsets, the more points you'll have to spend (and vice versa)."),i("li",null,"Choosing a number pre-fills various fields, though these can still be customized.")],-1),me=[de],pe=i("div",{class:"radial-divisor"},null,-1),ce={key:3,class:"row col-sm small text-secondary"},he=i("p",null," Keep in mind that your quest may need revision before it is approved and published on the Mappers' Guild quest listing! ",-1),fe=i("p",null," If your quest is rejected, your spent points will be returned and pishifat will send you a message explaining why it was rejected. You may re-submit the quest with changes according to that message. Minor wording changes will be modified by pishifat without rejection. ",-1),be=["disabled"],ye=i("i",{class:"fas fa-coins"},null,-1),$e={key:4,class:"row col-sm"},ge=i("i",{class:"fas fa-coins"},null,-1),ve={key:0,class:"mt-2"},Ve={class:"small text-secondary"},ke=["onClick"],Ce=i("i",{class:"fas fa-minus"},null,-1),qe=[Ce];function _e(e,t,n,b,y,$){const u=d("form-select"),a=d("form-input"),C=d("form-textarea"),w=d("form-checkbox"),P=d("modal-dialog");return o(),g(P,{id:"submitQuest",title:e.isAdmin?"Add quest":"Submit quest"},{default:c(()=>[i("div",ie,[r(u,{modelValue:e.selectedArtist,"onUpdate:modelValue":t[0]||(t[0]=s=>e.selectedArtist=s),label:"Artist",placeholder:"No specific artist"},{default:c(()=>[oe,(o(!0),l(V,null,q(e.featuredArtists,s=>(o(),l("option",{key:s.id,value:s.osuId+"|"+s.label},m(s.label),9,ae))),128))]),_:1},8,["modelValue"]),e.isAdmin?p("",!0):(o(),l("div",le,re)),r(a,{modelValue:e.mapsetCount,"onUpdate:modelValue":t[1]||(t[1]=s=>e.mapsetCount=s),modelModifiers:{number:!0},label:"Required mapsets",type:"number"},null,8,["modelValue"]),e.isAdmin?p("",!0):(o(),l("div",ue,me)),r(a,{modelValue:e.name,"onUpdate:modelValue":t[2]||(t[2]=s=>e.name=s),label:"Name"},null,8,["modelValue"]),r(C,{modelValue:e.objective,"onUpdate:modelValue":t[3]||(t[3]=s=>e.objective=s),label:"Objective"},null,8,["modelValue"]),r(a,{modelValue:e.price,"onUpdate:modelValue":t[4]||(t[4]=s=>e.price=s),modelModifiers:{number:!0},label:"Price",type:"number",placeholder:"price per party member...",description:"...points required per party member"},null,8,["modelValue"]),r(a,{modelValue:e.timeframe,"onUpdate:modelValue":t[5]||(t[5]=s=>e.timeframe=s),modelModifiers:{number:!0},label:"Timeframe",type:"number",description:"...days to complete quest"},null,8,["modelValue"]),r(a,{modelValue:e.minParty,"onUpdate:modelValue":t[6]||(t[6]=s=>e.minParty=s),modelModifiers:{number:!0},label:"Party size (min)",type:"number"},null,8,["modelValue"]),r(a,{modelValue:e.maxParty,"onUpdate:modelValue":t[7]||(t[7]=s=>e.maxParty=s),modelModifiers:{number:!0},label:"Party size (max)",type:"number",description:"...members required to accept quest (min/max)"},null,8,["modelValue"]),e.isAdmin?(o(),l(V,{key:2},[r(a,{modelValue:e.minRank,"onUpdate:modelValue":t[8]||(t[8]=s=>e.minRank=s),modelModifiers:{number:!0},label:"Party rank (min)",type:"number",description:"...rank required to accept quest"},null,8,["modelValue"]),r(w,{id:"isMbcCheckbox",modelValue:e.isMbc,"onUpdate:modelValue":t[9]||(t[9]=s=>e.isMbc=s),label:"is MBC",info:"Toggle isMbc"},null,8,["modelValue"])],64)):p("",!0),pe,e.isAdmin?(o(),l("div",$e,[i("button",{class:"btn btn-outline-secondary w-100",onClick:t[11]||(t[11]=s=>e.addToQueue())},[v(" Add quest to queue "),ge]),e.queuedQuests.length?(o(),l("div",ve,[v(" Pending quests "),i("ul",Ve,[(o(!0),l(V,null,q(e.queuedQuests,s=>(o(),l("li",{key:s.name},[v(m(s.name)+" ",1),i("a",{href:"#",class:"text-danger",onClick:S(we=>e.removeFromQueue(s.name),["prevent"])},qe,8,ke)]))),128))])])):p("",!0),e.queuedQuests.length?(o(),l("button",{key:1,class:"btn btn-outline-success w-100",onClick:t[12]||(t[12]=s=>e.scheduleQuests(s))}," Schedule quests ")):p("",!0)])):(o(),l("div",ce,[he,fe,i("button",{class:"btn btn-outline-success w-100",disabled:!e.enoughPoints,onClick:t[10]||(t[10]=s=>e.submitQuest(s))},[v(m(`Submit quest for approval: ${e.points} pts`)+" ",1),ye],8,be)]))])]),_:1},8,["title"])}const Se=f(se,[["render",_e]]);export{Se as S};