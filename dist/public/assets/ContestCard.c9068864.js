import{_ as t}from"./index.59af7da6.js";import{d as e,h as s,o,b as n,f as c,s as a,e as r,t as d}from"./vendor.b9ef672a.js";var i=e({name:"ContestCard",components:{ModesIcons:t},props:{contest:{type:Object,required:!0},route:{type:String,required:!0}},data:()=>({contestName:""}),methods:{selectContest(){this.$store.commit("setSelectedContestId",this.contest.id),this.$route.query.id!==this.contest.id&&this.$router.replace(`/contests/${this.route}?contest=${this.contest.id}`)}}});const l={class:"card card-hover card-level-2 card-body"},m={class:"mb-2"},u={class:"me-1"},h=["href"],p={key:1},f={class:"text-secondary"};i.render=function(t,e,i,v,y,b){const k=s("modes-icons");return o(),n("div",{onClick:e[0]||(e[0]=e=>t.selectContest())},[c("div",l,[c("div",m,[c("span",u,[t.contest.mode?(o(),a(k,{key:0,modes:[t.contest.mode]},null,8,["modes"])):r("",!0)]),t.contest.url&&t.contest.url.length?(o(),n("a",{key:0,href:t.contest.url,target:"_blank"},d(t.contest.name),9,h)):(o(),n("span",p,d(t.contest.name),1))]),c("div",f,d("complete"==t.contest.status||"hidden"==t.contest.status||"locked"==t.contest.status?t.contest.status:t.contest.status+" phase"),1)])])};export{i as _};
