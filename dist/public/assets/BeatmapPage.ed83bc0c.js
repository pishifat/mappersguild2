var t=Object.defineProperty,e=Object.defineProperties,a=Object.getOwnPropertyDescriptors,s=Object.getOwnPropertySymbols,n=Object.prototype.hasOwnProperty,d=Object.prototype.propertyIsEnumerable,o=(e,a,s)=>a in e?t(e,a,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[a]=s;import{d as i,o as r,b as l,f as p,t as u,F as m,g as c,i as b,u as h,w as f,q as y,O as k,e as B,l as I,j as g,m as M}from"./vendor.8b5721c7.js";import{C as w}from"./CopyPaste.7cb4b414.js";import{_ as v}from"./ModalDialog.2c18b0dc.js";import{_ as x}from"./BeatmapInfoAdmin.78107f6c.js";import{_ as O}from"./DataTable.63fe7b68.js";import{_ as P}from"./ModesIcons.88090f43.js";var q=i({name:"BeatmapList",props:{beatmaps:{type:Array,default:()=>[]},displayMode:{type:String,default:null},rawMode:{type:String,default:null}},computed:{navigation(){return'<a id="'+this.rawMode+'"></a>'}},methods:{hasUniqueMapper(t){let e="";for(const a of t)for(const t of a.mappers)if(e){if(e!==t.id)return!1}else e=t.id;return!0}}});const U=p("br",null,null,-1);q.render=function(t,e,a,s,n,d){return r(),l("div",null,[p("p",null," ## "+u(t.navigation+t.displayMode),1),(r(!0),l(m,null,c(t.beatmaps,(e=>(r(),l("div",{key:e.id}," - ["+u(e.song.artist)+" - "+u(e.song.title)+"]("+u(e.url)+") "+u(t.hasUniqueMapper(e.tasks)?"by":"hosted by")+" ["+u(e.host.username)+"]("+u("https://osu.ppy.sh/users/"+e.host.osuId)+") ",1)))),128)),U])};var C=i({name:"NewsPost",components:{BeatmapList:q,CopyPaste:w,ModalDialog:v},data:()=>({date:"2020-11-20",beatmaps:[],quests:[],externalBeatmaps:[],users:[]}),computed:{osuBeatmaps(){return this.beatmaps.filter((t=>"osu"==t.mode))},taikoBeatmaps(){return this.beatmaps.filter((t=>"taiko"==t.mode))},catchBeatmaps(){return this.beatmaps.filter((t=>"catch"==t.mode))},maniaBeatmaps(){return this.beatmaps.filter((t=>"mania"==t.mode))},hybridBeatmaps(){return this.beatmaps.filter((t=>"hybrid"==t.mode))}},methods:{async loadNewsInfo(t){const e=await this.$http.executeGet("/admin/beatmaps/loadNewsInfo/"+this.date,t);e&&(this.beatmaps=e.beatmaps,this.quests=e.quests,this.externalBeatmaps=e.externalBeatmaps,this.users=e.users)},questModes(t){let e="";for(let a=0;a<t.length;a++){const s=t[a];e+="osu"==s?"osu!":"osu!"+s,a<t.length-1&&(e+=", ")}return e},separateUsername:(t,e)=>t<e-2?", ":t<e-1?" and":"",separateCommas:(t,e)=>t<e-1?", ":"",hasMultipleMappers(t){const e=[];return t.forEach((t=>{t.mappers.forEach((t=>{e.includes(t)||e.push(t)}))})),e.length>1}}});const j={key:0},A={key:0},_=I(" This quest was completed by "),L={key:0},D=p("br",null,null,-1),S={key:1},$=p("br",null,null,-1),T={key:2},E=p("div",null,"[**osu!**](#osu)",-1),N=p("div",null,"[**osu!taiko**](#taiko)",-1),G=p("div",null,"[**osu!catch**](#catch)",-1),R=p("div",null,"[**osu!mania**](#mania)",-1),Y=p("div",null,"[*Multiple mode mapsets**](#hybrid)",-1),F=p("br",null,null,-1),Q={key:4},V={key:6},K=p("div",null," | User | Modes | Beatmaps Ranked | Difficulties Ranked | ",-1),z=p("div",null," | :-- | :-- | :-- | :-- | ",-1);C.render=function(t,e,a,s,n,d){const o=b("copy-paste"),i=b("beatmap-list"),M=b("modal-dialog");return r(),h(M,{id:"newsPost",title:"Generate news post"},{default:f((()=>[p("p",null,[p("button",{class:"btn btn-sm btn-outline-info",onClick:e[0]||(e[0]=e=>t.loadNewsInfo(e))}," Load beatmap and quest data "),y(p("input",{"onUpdate:modelValue":e[1]||(e[1]=e=>t.date=e),class:"form-control form-control-sm mx-2 w-25",type:"text",autocomplete:"off",placeholder:"YYYY-MM-DD"},null,512),[[k,t.date]])]),t.quests?(r(),l("p",j," Quest data: ")):B("",!0),t.quests?(r(),h(o,{key:1,distinct:"quests"},{default:f((()=>[(r(!0),l(m,null,c(t.quests,(e=>(r(),l("div",{key:e.id},[e.requiredMapsets>2?(r(),l("div",A,[p("p",null,u(e.art&&e.associatedMaps.length?"!["+e.associatedMaps[0].song.artist+" header](https://assets.ppy.sh/artists/"+e.art+"/header.jpg)":"![Mystery header](/wiki/shared/news/banners/mappersguild-mystery.jpg)"),1),p("p",null," For the **"+u(e.name+" ("+t.questModes(e.modes)+")")+"** quest, the mapper"+u(1==e.currentParty.members.length?"":"s")+" had to "+u(e.descriptionMain.substring(0,1).toLowerCase()+e.descriptionMain.substring(1)),1),p("p",null,[_,(r(!0),l(m,null,c(e.currentParty.members,((a,s)=>(r(),l("span",{key:a.id}," **["+u(a.username)+"]("+u("https://osu.ppy.sh/users/"+a.osuId)+")**"+u(t.separateUsername(s,e.currentParty.members.length)),1)))),128))]),(r(!0),l(m,null,c(e.associatedMaps,(a=>(r(),l("div",{key:a.id},[I(" - ["+u(a.song.artist)+" - "+u(a.song.title)+"]("+u(a.url)+") "+u(t.hasMultipleMappers(a.tasks)?"hosted by":"by")+" ["+u(a.host.username)+"]("+u("https://osu.ppy.sh/users/"+a.host.osuId)+") ",1),e.modes.length>1?(r(),l("span",L," ("+u("osu"==a.mode?"osu!":"hybrid"==a.mode?"hybrid":"osu!"+a.mode)+") ",1)):B("",!0)])))),128)),D])):(r(),l("div",S,[I(" - **"+u(e.name+" ("+t.questModes(e.modes)+")")+"**: ",1),(r(!0),l(m,null,c(e.associatedMaps,((a,s)=>(r(),l("span",{key:a.id}," ["+u(a.song.artist)+" - "+u(a.song.title)+"]("+u(a.url)+") "+u(t.hasMultipleMappers(a.tasks)?"hosted by":"by")+" ["+u(a.host.username)+"]("+u("https://osu.ppy.sh/users/"+a.host.osuId)+")"+u(t.separateUsername(s,e.associatedMaps.length)),1)))),128)),$]))])))),128))])),_:1})):B("",!0),t.beatmaps?(r(),l("p",T," Other beatmap data: ")):B("",!0),t.beatmaps?(r(),h(o,{key:3,distinct:"beatmaps"},{default:f((()=>[E,N,G,R,Y,F,g(i,{beatmaps:t.osuBeatmaps,"display-mode":"osu!","raw-mode":"osu"},null,8,["beatmaps"]),g(i,{beatmaps:t.taikoBeatmaps,"display-mode":"osu!taiko","raw-mode":"taiko"},null,8,["beatmaps"]),g(i,{beatmaps:t.catchBeatmaps,"display-mode":"osu!catch","raw-mode":"catch"},null,8,["beatmaps"]),g(i,{beatmaps:t.maniaBeatmaps,"display-mode":"osu!mania","raw-mode":"mania"},null,8,["beatmaps"]),g(i,{beatmaps:t.hybridBeatmaps,"display-mode":"multiple modes","raw-mode":"hybrid"},null,8,["beatmaps"])])),_:1})):B("",!0),t.externalBeatmaps?(r(),l("p",Q," External beatmaps (sort these manually): ")):B("",!0),t.externalBeatmaps?(r(),h(o,{key:5,distinct:"external"},{default:f((()=>[(r(!0),l(m,null,c(t.externalBeatmaps,(t=>(r(),l("div",{key:t.osuId}," - ["+u(t.artist)+" - "+u(t.title)+"]("+u("https://osu.ppy.sh/beatmapsets/"+t.osuId)+") hosted by ["+u(t.creator)+"]("+u("https://osu.ppy.sh/users/"+t.creatorOsuId)+") ",1)))),128))])),_:1})):B("",!0),t.users?(r(),l("p",V," Users with ranked maps/tasks: ")):B("",!0),t.users?(r(),h(o,{key:7,distinct:"users"},{default:f((()=>[K,z,(r(!0),l(m,null,c(t.users,(e=>(r(),l("div",{key:e.id},[I(" | ["+u(e.username)+"]("+u("https://osu.ppy.sh/users/"+e.osuId)+") | ",1),(r(!0),l(m,null,c(e.modes,((a,s)=>(r(),l("span",{key:a},u("osu"==a?"osu!":"sb"==a?"Storyboarder":"osu!"+a)+u(t.separateCommas(s,e.modes.length)),1)))),128)),I(" | "+u(e.hostCount)+" | "+u(e.taskCount)+" | ",1)])))),128))])),_:1})):B("",!0)])),_:1})};var H=i({name:"BundledBeatmapsList",components:{CopyPaste:w},data:()=>({bundledBeatmaps:[]}),computed:{osuBeatmaps(){return this.bundledBeatmaps.filter((t=>"osu"==t.mode))},taikoBeatmaps(){return this.bundledBeatmaps.filter((t=>"taiko"==t.mode))},catchBeatmaps(){return this.bundledBeatmaps.filter((t=>"catch"==t.mode))},maniaBeatmaps(){return this.bundledBeatmaps.filter((t=>"mania"==t.mode))}},methods:{async findBundledBeatmaps(t){const e=await this.$http.executeGet("/admin/beatmaps/findBundledBeatmaps",t);e&&!e.error&&(this.bundledBeatmaps=e)},findOsuId(t){const e=t.indexOf("beatmapsets/")+"beatmapsets/".length,a=t.indexOf("#");let s="";return s=-1!==a?t.slice(e,a):t.slice(e),parseInt(s,10)}}});const J={class:"container card card-body py-1 mb-4"},W={key:0},X=p("p",null,"osu",-1),Z=p("p",null,"taiko",-1),tt=p("p",null,"catch",-1),et=p("p",null,"mania",-1);H.render=function(t,e,a,s,n,d){const o=b("copy-paste");return r(),l("div",J,[p("button",{class:"btn btn-sm w-100 btn-outline-info",onClick:e[0]||(e[0]=e=>t.findBundledBeatmaps(e))}," Load bundled beatmaps "),t.bundledBeatmaps.length?(r(),l("div",W,[X,g(o,{distinct:"osu"},{default:f((()=>[(r(!0),l(m,null,c(t.osuBeatmaps,(e=>(r(),l("div",{key:e.id},u(t.findOsuId(e.url)),1)))),128))])),_:1}),Z,g(o,{distinct:"taiko"},{default:f((()=>[(r(!0),l(m,null,c(t.taikoBeatmaps,(e=>(r(),l("div",{key:e.id},u(t.findOsuId(e.url)),1)))),128))])),_:1}),tt,g(o,{distinct:"catch"},{default:f((()=>[(r(!0),l(m,null,c(t.catchBeatmaps,(e=>(r(),l("div",{key:e.id},u(t.findOsuId(e.url)),1)))),128))])),_:1}),et,g(o,{distinct:"mania"},{default:f((()=>[(r(!0),l(m,null,c(t.maniaBeatmaps,(e=>(r(),l("div",{key:e.id},u(t.findOsuId(e.url)),1)))),128))])),_:1})])):B("",!0)])};var at=i({name:"BeatmapPackIdListGenerator",components:{CopyPaste:w},data:()=>({inputUrls:"",output:""}),methods:{findOsuId(t){const e=t.indexOf("beatmapsets/")+"beatmapsets/".length,a=t.indexOf("#");let s="";return s=-1!==a?t.slice(e,a):t.slice(e),parseInt(s,10)},generateBeatmapPackIdList(){let t="";const e=this.inputUrls.split("\n");for(const a of e){const e=this.findOsuId(a);isNaN(e)?t+=`FAILED (${a})`:t+=e,t+=","}this.output=t.substring(0,t.length-1)}}});const st={class:"container card card-body py-1 mb-4"},nt={key:0};at.render=function(t,e,a,s,n,d){const o=b("copy-paste");return r(),l("div",st,[y(p("textarea",{"onUpdate:modelValue":e[0]||(e[0]=e=>t.inputUrls=e),class:"form-control form-control-sm mx-2 mt-2 w-100",type:"text",autocomplete:"off",placeholder:"map URLs separated by newlines..."},null,512),[[k,t.inputUrls]]),p("button",{class:"btn btn-sm w-100 btn-outline-info",onClick:e[1]||(e[1]=e=>t.generateBeatmapPackIdList())}," Generate beatmap pack ID list "),t.output.length?(r(),l("div",nt,[g(o,null,{default:f((()=>[I(u(t.output),1)])),_:1})])):B("",!0)])};var dt,ot,it={state:{beatmaps:[]},mutations:{setBeatmaps(t,e){t.beatmaps=e},updateBeatmapStatus(t,e){const a=t.beatmaps.find((t=>t.id==e.beatmapId));a&&(a.status=e.status)},deleteTask(t,e){const a=t.beatmaps.find((t=>t.id==e.beatmapId));if(a){const t=a.tasks.findIndex((t=>t.id==e.taskId));-1!==t&&a.tasks.splice(t,1)}},deleteModder(t,e){const a=t.beatmaps.find((t=>t.id==e.beatmapId));if(a){const t=a.modders.findIndex((t=>t.id==e.modderId));-1!==t&&a.modders.splice(t,1)}},updateUrl(t,e){const a=t.beatmaps.find((t=>t.id==e.beatmapId));a&&(a.url=e.url)},updateStoryboardQuality(t,e){const a=t.beatmaps.find((t=>t.id==e.beatmapId));if(a){const t=a.tasks.findIndex((t=>t.id==e.taskId));-1!==t&&(a.tasks[t]=e.task)}},updatePackId(t,e){const a=t.beatmaps.find((t=>t.id==e.beatmapId));a&&(a.packId=e.packId)},updateIsShowcase(t,e){const a=t.beatmaps.find((t=>t.id==e.beatmapId));a&&(a.isShowcase=e.isShowcase)}}},rt=i({components:{NewsPost:C,DataTable:O,BeatmapInfoAdmin:x,BundledBeatmapsList:H,BeatmapPackIdListGenerator:at,ModesIcons:P},data:()=>({selectedBeatmapId:""}),computed:(dt=((t,e)=>{for(var a in e||(e={}))n.call(e,a)&&o(t,a,e[a]);if(s)for(var a of s(e))d.call(e,a)&&o(t,a,e[a]);return t})({},M({beatmaps:t=>t.beatmapsAdmin.beatmaps})),ot={selectedBeatmap(){return this.beatmaps.find((t=>t.id===this.selectedBeatmapId))}},e(dt,a(ot))),beforeCreate(){this.$store.hasModule("beatmapsAdmin")||this.$store.registerModule("beatmapsAdmin",it)},unmounted(){this.$store.hasModule("beatmapsAdmin")&&this.$store.unregisterModule("beatmapsAdmin")},async created(){const t=await this.$http.initialRequest("/admin/beatmaps/load");this.$http.isError(t)||this.$store.commit("setBeatmaps",t)},methods:{updateBeatmap(t){const e=this.beatmaps.findIndex((e=>e.id==t.id));-1!==e&&(this.beatmaps[e]=t)},formatMetadata(t){if(!t)return"";let e=t.artist+" - ";return t.title.length>40?e+=t.title.slice(0,40)+"...":e+=t.title,e}}});const lt={class:"container card card-body py-1"},pt={class:"row"},ut={class:"col-sm"},mt=p("button",{class:"btn btn-sm btn-info w-100","data-bs-toggle":"modal","data-bs-target":"#newsPost"}," Create news post ",-1),ct={class:"text-truncate"},bt=["href"],ht={key:1,class:"ms-1"};rt.render=function(t,e,a,s,n,d){const o=b("modes-icons"),i=b("user-link"),m=b("data-table"),c=b("beatmap-info-admin"),y=b("news-post"),k=b("bundled-beatmaps-list"),I=b("beatmap-pack-id-list-generator");return r(),l("div",null,[p("div",lt,[p("div",pt,[p("div",ut,[mt,g(m,{data:t.beatmaps,headers:["METADATA","PACK ID","CREATOR","STATUS"],"custom-data-target":"#editBeatmap","onUpdate:selectedId":e[0]||(e[0]=e=>t.selectedBeatmapId=e)},{default:f((({obj:e})=>[p("td",ct,[g(o,{modes:[e.mode]},null,8,["modes"]),e.url?(r(),l("a",{key:0,href:e.url,class:"ms-1"},u(t.formatMetadata(e.song)),9,bt)):(r(),l("span",ht,u(t.formatMetadata(e.song)),1))]),p("td",null,u(e.packId),1),p("td",null,[g(i,{user:e.host},null,8,["user"])]),p("td",null,u(e.status),1)])),_:1},8,["data"])])])]),t.selectedBeatmap?(r(),h(c,{key:0,beatmap:t.selectedBeatmap,onUpdateBeatmap:e[1]||(e[1]=e=>t.updateBeatmap(e))},null,8,["beatmap"])):B("",!0),g(y),g(k),g(I)])};export{rt as default};