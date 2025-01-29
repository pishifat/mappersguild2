import{d as A,_ as h,o as d,e as a,a as i,i as p,w as _,F as k,r as I,t as l,k as g,p as f,b,f as y,j as w,m as R,c as L}from"./index-eb01d7f8.js";import{F as U}from"./FeaturedArtistInfo-047e2b4a.js";import{C as v}from"./CopyPaste-82a57233.js";import{D as C}from"./DataTable-f14927db.js";import"./ModalDialog-eee53abc.js";const S=A({name:"RecentLicensedSongs",components:{CopyPaste:v},data(){return{songs:[]}},methods:{async findRecentlyLicensedSongs(e){const t=await this.$http.executeGet("/admin/featuredArtists/findRecentlyLicensedSongs",e);t&&!t.error&&(this.songs=t.songs)}}}),M={class:"container card card-body py-3 my-2"},T=i("h5",null,"Recently licensed songs",-1),D={key:0};function N(e,t,s,r,u,$){const c=f("copy-paste");return d(),a("div",M,[T,i("button",{class:"btn btn-sm w-100 btn-info",onClick:t[0]||(t[0]=n=>e.findRecentlyLicensedSongs(n))}," Load recently licensed songs "),e.songs.length?(d(),a("div",D,[p(c,{distinct:"songs"},{default:_(()=>[(d(!0),a(k,null,I(e.songs,(n,m)=>(d(),a("div",{key:m},l(n.artist)+" - "+l(n.title),1))),128))]),_:1})])):g("",!0)])}const V=h(S,[["render",N]]),B=A({name:"ArtistRankedMaps",components:{CopyPaste:v},data(){return{artists:[],date:"2024-01-01",threshold:0}},methods:{async loadArtists(e){const t=await this.$http.executePost("/admin/featuredArtists/loadArtistsWithoutRankedMaps",{date:this.date,threshold:this.threshold},e);t&&!t.error&&(this.artists=t.artists)}}}),P={class:"container card card-body py-3 my-2"},z=i("h5",null,"Recently Ranked maps",-1),E=i("div",{class:"mb-2"}," Load artists who've had less than x maps Ranked in specific timeframe ",-1),G={class:"row mb-2 mx-1"},O={key:0},j=["href"];function x(e,t,s,r,u,$){const c=f("copy-paste");return d(),a("div",P,[z,E,i("div",G,[b(i("input",{"onUpdate:modelValue":t[0]||(t[0]=n=>e.date=n),class:"form-control form-control-sm mx-2 w-25",type:"date",autocomplete:"off",placeholder:"how far back to check"},null,512),[[y,e.date]]),b(i("input",{"onUpdate:modelValue":t[1]||(t[1]=n=>e.threshold=n),class:"form-control form-control-sm mx-2 w-25",type:"number",autocomplete:"off",placeholder:"how many maps"},null,512),[[y,e.threshold]]),i("button",{class:"btn btn-sm btn-info w-25",onClick:t[2]||(t[2]=n=>e.loadArtists(n))}," Load artists ")]),e.artists.length?(d(),a("div",O,[p(c,{distinct:"artists"},{default:_(()=>[(d(!0),a(k,null,I(e.artists,(n,m)=>(d(),a("div",{key:m},[w(l(n.rankedMaps)+" - ",1),i("a",{href:`https://osu.ppy.sh/beatmaps/artists/${n.osuId}`},l(n.name),9,j)]))),128))]),_:1})])):g("",!0)])}const W=h(B,[["render",x]]),q={state:{featuredArtists:[]},mutations:{setFeaturedArtists(e,t){e.featuredArtists=t},updateOsuId(e,t){const s=e.featuredArtists.find(r=>r.id==t.featuredArtistId);s&&(s.osuId=t.osuId)},updateName(e,t){const s=e.featuredArtists.find(r=>r.id==t.featuredArtistId);s&&(s.label=t.name)},updateReferenceUrl(e,t){const s=e.featuredArtists.find(r=>r.id==t.featuredArtistId);s&&(s.referenceUrl=t.referenceUrl)},updateOszTemplatesUrl(e,t){const s=e.featuredArtists.find(r=>r.id==t.featuredArtistId);s&&(s.oszTemplatesUrl=t.oszTemplatesUrl)},updateOfferedUsers(e,t){const s=e.featuredArtists.find(r=>r.id==t.featuredArtistId);s&&(s.offeredUsers=t.offeredUsers)},addSong(e,t){const s=e.featuredArtists.find(r=>r.id==t.featuredArtistId);s&&s.songs.push(t.song)},updateSong(e,t){const s=e.featuredArtists.find(r=>r.id==t.featuredArtistId);if(s){const r=s.songs.findIndex(u=>u.id==t.song.id);r!==-1&&(s.songs[r]=t.song)}},deleteSong(e,t){const s=e.featuredArtists.find(r=>r.id==t.featuredArtistId);if(s){const r=s.songs.findIndex(u=>u.id==t.songId);r!==-1&&s.songs.splice(r,1)}},updateNotes(e,t){const s=e.featuredArtists.find(r=>r.id==t.featuredArtistId);s&&(s.notes=t.notes)},updateLastReviewed(e,t){const s=e.featuredArtists.find(r=>r.id==t.featuredArtistId);s&&(s.lastReviewed=t.lastReviewed)},updatePermanentlyDismiss(e,t){const s=e.featuredArtists.find(r=>r.id==t.featuredArtistId);s&&(s.permanentlyDismiss=t.permanentlyDismiss)}}},H=q,J=A({components:{DataTable:C,FeaturedArtistInfo:U,RecentLicensedSongs:V,ArtistRankedMaps:W},data(){return{selectedFeaturedArtistId:""}},computed:{...R({featuredArtists:e=>e.artistsAdmin.featuredArtists}),selectedFeaturedArtist(){return this.featuredArtists.find(e=>e.id===this.selectedFeaturedArtistId)}},beforeCreate(){this.$store.hasModule("artistsAdmin")||this.$store.registerModule("artistsAdmin",H)},unmounted(){this.$store.hasModule("artistsAdmin")&&this.$store.unregisterModule("artistsAdmin")},methods:{async loadRelevantFeaturedArtists(e){const t=await this.$http.executeGet("/admin/featuredArtists/loadRelevant",e);this.$http.isError(t)||this.$store.commit("setFeaturedArtists",t)},async loadAllFeaturedArtists(e){const t=await this.$http.executeGet("/admin/featuredArtists/loadAll",e);this.$http.isError(t)||this.$store.commit("setFeaturedArtists",t)}}}),K={class:"container card card-body py-3"},Q=i("h5",null,"Featured Artists list",-1),X=["href"],Y={key:1};function Z(e,t,s,r,u,$){const c=f("data-table"),n=f("recent-licensed-songs"),m=f("artist-ranked-maps"),F=f("featured-artist-info");return d(),a("div",null,[i("div",K,[Q,i("button",{class:"btn btn-sm btn-info w-100",onClick:t[0]||(t[0]=o=>e.loadRelevantFeaturedArtists(o))}," Load (relevant) Featured Artists "),i("button",{class:"btn btn-sm btn-info w-100 mt-2",onClick:t[1]||(t[1]=o=>e.loadAllFeaturedArtists(o))}," Load (all) Featured Artists "),e.featuredArtists.length?(d(),L(c,{key:0,class:"mt-2",data:e.featuredArtists,headers:["ARTIST"],"custom-data-target":"#editFeaturedArtist","onUpdate:selectedId":t[2]||(t[2]=o=>e.selectedFeaturedArtistId=o)},{default:_(({obj:o})=>[i("td",null,[o.osuId?(d(),a("a",{key:0,href:"https://osu.ppy.sh/beatmaps/artists/"+o.osuId,target:"_blank"},l(o.label),9,X)):(d(),a("span",Y,l(o.label),1))])]),_:1},8,["data"])):g("",!0)]),p(n),p(m),p(F,{"featured-artist":e.selectedFeaturedArtist},null,8,["featured-artist"])])}const it=h(J,[["render",Z]]);export{it as default};
