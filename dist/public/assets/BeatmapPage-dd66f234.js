import{d as I,_ as $,o as n,c as g,w as b,a as i,b as M,f as A,e as d,k as B,r as _,j as C,t as r,F as k,p as l,i as u,M as P,m as S}from"./index-970ccb5e.js";import{C as v}from"./CopyPaste-20ad41c9.js";import{M as D}from"./ModalDialog-390e660e.js";import{B as L}from"./BeatmapInfoAdmin-4abe64e7.js";import{D as N}from"./DataTable-d60f5f19.js";import"./task-21eeb954.js";import"./TasksChoice-caab8687.js";const T=I({name:"NewsPost",components:{CopyPaste:v,ModalDialog:D},data(){return{date:"2022-07-24",externalBeatmaps:[],users:[]}},methods:{async loadNewsInfo(t){const e=await this.$http.executeGet("/admin/beatmaps/loadNewsInfo/"+this.date,t);e&&(this.users=e.users)},separateCommas(t,e){return t<e-1?", ":""}}}),E={key:0},G=i("div",null," | User | Modes | Ranked beatmaps | Ranked difficulties | ",-1),R=i("div",null," | :-- | :-- | :-- | :-- | ",-1);function V(t,e,s,a,f,w){const c=l("copy-paste"),o=l("modal-dialog");return n(),g(o,{id:"newsPost",title:"Generate news post"},{default:b(()=>[i("p",null,[i("button",{class:"btn btn-sm btn-outline-info",onClick:e[0]||(e[0]=p=>t.loadNewsInfo(p))}," Load user info "),M(i("input",{"onUpdate:modelValue":e[1]||(e[1]=p=>t.date=p),class:"form-control form-control-sm mx-2 w-25",type:"text",autocomplete:"off",placeholder:"YYYY-MM-DD"},null,512),[[A,t.date]])]),t.users?(n(),d("p",E," Users with ranked maps/tasks: ")):B("",!0),t.users?(n(),g(c,{key:1,distinct:"users"},{default:b(()=>[G,R,(n(!0),d(k,null,_(t.users,p=>(n(),d("div",{key:p.id},[C(" | "+r(p.flag)+" ["+r(p.username)+"]("+r("https://osu.ppy.sh/users/"+p.osuId)+") | ",1),(n(!0),d(k,null,_(p.modes,(h,y)=>(n(),d("span",{key:h},r(h=="osu"?"osu!":h=="sb"?"Storyboarder":h=="hs"?"Hitsounder":"osu!"+h)+r(t.separateCommas(y,p.modes.length)),1))),128)),C(" | "+r(p.hostCount)+" | "+r(p.taskCount)+" | ",1)]))),128))]),_:1})):B("",!0)]),_:1})}const Y=$(T,[["render",V]]),x=I({name:"BundledBeatmapsList",components:{CopyPaste:v},data(){return{bundledBeatmaps:[]}},computed:{osuBeatmaps(){return this.bundledBeatmaps.filter(t=>t.mode=="osu")},taikoBeatmaps(){return this.bundledBeatmaps.filter(t=>t.mode=="taiko")},catchBeatmaps(){return this.bundledBeatmaps.filter(t=>t.mode=="catch")},maniaBeatmaps(){return this.bundledBeatmaps.filter(t=>t.mode=="mania")}},methods:{async findBundledBeatmaps(t){const e=await this.$http.executeGet("/admin/beatmaps/findBundledBeatmaps",t);e&&!e.error&&(this.bundledBeatmaps=e)},findOsuId(t){const e=t.indexOf("beatmapsets/")+12,s=t.indexOf("#");let a="";return s!==-1?a=t.slice(e,s):a=t.slice(e),parseInt(a,10)}}}),F={class:"container card card-body py-1 mb-4"},W={key:0},j=i("p",null,"osu",-1),q=i("p",null,"taiko",-1),H=i("p",null,"catch",-1),K=i("p",null,"mania",-1);function Q(t,e,s,a,f,w){const c=l("copy-paste");return n(),d("div",F,[i("button",{class:"btn btn-sm w-100 btn-outline-info",onClick:e[0]||(e[0]=o=>t.findBundledBeatmaps(o))}," Load bundled beatmaps "),t.bundledBeatmaps.length?(n(),d("div",W,[j,u(c,{distinct:"osu"},{default:b(()=>[(n(!0),d(k,null,_(t.osuBeatmaps,o=>(n(),d("div",{key:o.id},r(t.findOsuId(o.url)),1))),128))]),_:1}),q,u(c,{distinct:"taiko"},{default:b(()=>[(n(!0),d(k,null,_(t.taikoBeatmaps,o=>(n(),d("div",{key:o.id},r(t.findOsuId(o.url)),1))),128))]),_:1}),H,u(c,{distinct:"catch"},{default:b(()=>[(n(!0),d(k,null,_(t.catchBeatmaps,o=>(n(),d("div",{key:o.id},r(t.findOsuId(o.url)),1))),128))]),_:1}),K,u(c,{distinct:"mania"},{default:b(()=>[(n(!0),d(k,null,_(t.maniaBeatmaps,o=>(n(),d("div",{key:o.id},r(t.findOsuId(o.url)),1))),128))]),_:1})])):B("",!0)])}const z=$(x,[["render",Q]]),J=I({name:"BeatmapPackIdListGenerator",components:{CopyPaste:v},data(){return{inputUrls:"",output:""}},methods:{findOsuId(t){const e=t.indexOf("beatmapsets/")+12,s=t.indexOf("#");let a="";return s!==-1?a=t.slice(e,s):a=t.slice(e),parseInt(a,10)},generateBeatmapPackIdList(){let t="";const e=this.inputUrls.split(`
`);for(const s of e){const a=this.findOsuId(s);isNaN(a)?t+=`FAILED (${s})`:t+=a,t+=","}this.output=t.substring(0,t.length-1)}}}),X={class:"container card card-body py-1 mb-4"},Z={key:0};function tt(t,e,s,a,f,w){const c=l("copy-paste");return n(),d("div",X,[M(i("textarea",{"onUpdate:modelValue":e[0]||(e[0]=o=>t.inputUrls=o),class:"form-control form-control-sm mx-2 mt-2 w-100",type:"text",autocomplete:"off",placeholder:"map URLs separated by newlines..."},null,512),[[A,t.inputUrls]]),i("button",{class:"btn btn-sm w-100 btn-outline-info",onClick:e[1]||(e[1]=o=>t.generateBeatmapPackIdList())}," Generate beatmap pack ID list "),t.output.length?(n(),d("div",Z,[u(c,null,{default:b(()=>[C(r(t.output),1)]),_:1})])):B("",!0)])}const et=$(J,[["render",tt]]),st={state:{beatmaps:[]},mutations:{setBeatmaps(t,e){t.beatmaps=e},updateBeatmap(t,e){const s=t.beatmaps.findIndex(a=>a.id===e.id);s!==-1&&(t.beatmaps[s]=e),console.log(e)},updateBeatmapStatus(t,e){const s=t.beatmaps.find(a=>a.id==e.beatmapId);s&&(s.status=e.status)},deleteTask(t,e){const s=t.beatmaps.find(a=>a.id==e.beatmapId);if(s){const a=s.tasks.findIndex(f=>f.id==e.taskId);a!==-1&&s.tasks.splice(a,1)}},deleteModder(t,e){const s=t.beatmaps.find(a=>a.id==e.beatmapId);if(s){const a=s.modders.findIndex(f=>f.id==e.modderId);a!==-1&&s.modders.splice(a,1)}},updateUrl(t,e){const s=t.beatmaps.find(a=>a.id==e.beatmapId);s&&(s.url=e.url)},updateStoryboardQuality(t,e){const s=t.beatmaps.find(a=>a.id==e.beatmapId);if(s){const a=s.tasks.findIndex(f=>f.id==e.taskId);a!==-1&&(s.tasks[a]=e.task)}},updatePackId(t,e){const s=t.beatmaps.find(a=>a.id==e.beatmapId);s&&(s.packId=e.packId)},updateIsShowcase(t,e){const s=t.beatmaps.find(a=>a.id==e.beatmapId);s&&(s.isShowcase=e.isShowcase)},updateIsWorldCup(t,e){const s=t.beatmaps.find(a=>a.id==e.beatmapId);s&&(s.isWorldCup=e.isWorldCup)}}},at=st,nt=I({components:{NewsPost:Y,DataTable:N,BeatmapInfoAdmin:L,BundledBeatmapsList:z,BeatmapPackIdListGenerator:et,ModesIcons:P},data(){return{selectedBeatmapId:""}},computed:{...S({beatmaps:t=>t.beatmapsAdmin.beatmaps}),selectedBeatmap(){return this.beatmaps.find(t=>t.id===this.selectedBeatmapId)}},beforeCreate(){this.$store.hasModule("beatmapsAdmin")||this.$store.registerModule("beatmapsAdmin",at)},unmounted(){this.$store.hasModule("beatmapsAdmin")&&this.$store.unregisterModule("beatmapsAdmin")},async created(){const t=await this.$http.initialRequest("/admin/beatmaps/load");this.$http.isError(t)||this.$store.commit("setBeatmaps",t)},methods:{updateBeatmap(t){const e=this.beatmaps.findIndex(s=>s.id==t.id);e!==-1&&(this.beatmaps[e]=t)},formatMetadata(t){if(!t)return"";let e=t.artist+" - ";return t.title.length>40?e+=t.title.slice(0,40)+"...":e+=t.title,e}}}),ot={class:"container card card-body py-1"},dt={class:"row"},it={class:"col-sm"},rt=i("button",{class:"btn btn-sm btn-info w-100","data-bs-toggle":"modal","data-bs-target":"#newsPost"}," Create news post ",-1),pt={class:"text-truncate"},mt=["href"],lt={key:1,class:"ms-1"};function ut(t,e,s,a,f,w){const c=l("modes-icons"),o=l("user-link"),p=l("data-table"),h=l("beatmap-info-admin"),y=l("news-post"),U=l("bundled-beatmaps-list"),O=l("beatmap-pack-id-list-generator");return n(),d("div",null,[i("div",ot,[i("div",dt,[i("div",it,[rt,u(p,{data:t.beatmaps,headers:["METADATA","PACK ID","CREATOR","STATUS"],"custom-data-target":"#editBeatmap","onUpdate:selectedId":e[0]||(e[0]=m=>t.selectedBeatmapId=m)},{default:b(({obj:m})=>[i("td",pt,[u(c,{modes:[m.mode]},null,8,["modes"]),m.url?(n(),d("a",{key:0,href:m.url,class:"ms-1"},r(t.formatMetadata(m.song)),9,mt)):(n(),d("span",lt,r(t.formatMetadata(m.song)),1))]),i("td",null,r(m.packId),1),i("td",null,[u(o,{user:m.host},null,8,["user"])]),i("td",null,r(m.status),1)]),_:1},8,["data"])])])]),t.selectedBeatmap?(n(),g(h,{key:0,beatmap:t.selectedBeatmap,onUpdateBeatmap:e[1]||(e[1]=m=>t.updateBeatmap(m))},null,8,["beatmap"])):B("",!0),u(y),u(U),u(O)])}const It=$(nt,[["render",ut]]);export{It as default};
