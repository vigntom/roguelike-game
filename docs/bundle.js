!function(e){function r(t){if(n[t])return n[t].exports;var o=n[t]={i:t,l:!1,exports:{}};return e[t].call(o.exports,o,o.exports,r),o.l=!0,o.exports}var n={};r.m=e,r.c=n,r.i=function(e){return e},r.d=function(e,n,t){r.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:t})},r.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(n,"a",n),n},r.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},r.p="",r(r.s=2)}([function(e,r,n){"use strict";function t(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}var o=n(3),a=n.n(o),i=function(){function e(e,r){var n=[],t=!0,o=!1,a=void 0;try{for(var i,c=e[Symbol.iterator]();!(t=(i=c.next()).done)&&(n.push(i.value),!r||n.length!==r);t=!0);}catch(e){o=!0,a=e}finally{try{!t&&c.return&&c.return()}finally{if(o)throw a}}return n}return function(r,n){if(Array.isArray(r))return r;if(Symbol.iterator in Object(r))return e(r,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();!function(e){function r(r){function a(e,r,n){var t=e||1,a=r||[],i=function(e){return e?R.dissoc("place",e):R.merge({level:1,experience:0,weapon:"stick"},{power:c.level(1).power,health:c.level(1).health})}(n),l={player:i,enemy:{},health:{},weapon:{},entry:{},exit:{},floor:t,dangeon:d.create(c.floor(t)),archive:a,viewport:y.create(t),state:o.gameStates.continues,lightOn:!1,fogDensity:30,settings:!1};return[l,u.genWorld(l,v.keepWorld)]}var u=function(){function e(e,r){return function(){return R.reduce(function(e,r){return r(e)()},r,e)}}function a(e,n){var t=e.player,o=e.enemy;return function(){return r(n({player:p.randomDamage(t),enemy:p.randomDamage(o)}))}}function l(e,n){return function(){return setTimeout(function(){return r(n)},e)}}function u(e,r,n,t){var o=arguments.length>4&&void 0!==arguments[4]?arguments[4]:0,a=h.create(e,{p1:r,p2:n}),i=d.fromSample(e,a,t);if(i.error){if(o>9)throw new Error("config Error! Wrong room / cooridor settings.");return u(e,r,n,t,o+1)}return{dangeon:i,sample:a}}function f(e,r,n,t){var a=t.dangeon,i=t.sample,c=o.enemies.boss.size||1,l=s.generateArea(e,a,i,c),u=d.batch(d.update);return[{enemy:R.reduce(function(e,n){return e[n.id]=R.merge(r,{place:n,area:l}),e},{},l)},{dangeon:u(l,n,a),sample:i}]}function v(e,t){return function(){var o=e.floor,a=c.floor(o),l=a.rows,s=a.cols,f={x:0,y:0},p={x:s,y:l},h=R.compose(r,t,R.merge(e)),v=u(o,f,p,e.dangeon),d=v.dangeon,g=c.floor(o).rooms,N=g>n.minOfEnemies?n.enemiesRate*g:n.minOfEnemies,M=Math.ceil(n.healthRate*N),S=[b(o),w(o,N),x(o,M),k("entry",o>1,o),k("exit",o<5,o)],E=R.reduce(function(e,r){var n=i(e,2),t=n[0],o=n[1],a=r(o);return[R.merge(t,a[0]),a[1]]},[{},v],S),P=i(E,2),z=P[0],j=P[1],D=m(o,e.player,z.entry,j),A=y.create(o,D.place),O=R.merge({dangeon:d,floor:o},z),W=R.append(O,e.archive);return h(R.merge(O,{player:D,archive:W,viewport:A}))}}var m=R.curry(function(e,r,n,t){var o=t.dangeon,a=t.sample,i=function(r){if(R.keys(r).length>0){var n=R.head(R.values(r)).place;return s.moveRight(n)}return s.generate(e,o,a)}(n);return R.assoc("place",i,r)}),g=R.curry(function(e,r,n,t){var o=i(t,2),a=o[0],c=o[1],l=c.dangeon,u=c.sample,f=s.generate(r,l,u),p={sample:u,dangeon:d.update(f,n,l)};return[R.assoc(f.id,R.merge(e,{place:f}),a),p]}),w=R.curry(function(e,r,n){var t=o.findItem({level:e})(o.enemies);if(void 0===t)throw new Error("There is not enemy for level "+e);var a=o.findItem({level:e})(o.weapons);if(void 0===t)throw new Error("There is not weapon for level "+e);var l=c.mark("enemy"),u=o.enemies[t],s=u.count||r,p=R.merge(u,{type:t,weapon:a});if("boss"===t)return f(e,p,l,n);var h=R.reduce(function(r){return g(p,e,l,r)},[{},n],R.range(0,s)),v=i(h,2);return[{enemy:v[0]},v[1]]}),x=R.curry(function(e,r,n){var t=o.findItem({level:e})(o.health);if(void 0===t)throw new Error("There is not health item for level "+e);var a=c.mark("health"),l={type:t},u=R.reduce(g(l,e,a),[{},n],R.range(0,r)),s=i(u,2);return[{health:s[0]},s[1]]}),b=R.curry(function(e,r){var n=r.dangeon,t=r.sample,a={},i=s.generate(e,n,t),l=o.findItem({level:e})(o.weapons);if(void 0===l)throw new Error("There is not weapon for level ",+e);return a[i.id]={type:l,place:i},[{weapon:a},{dangeon:d.update(i,c.mark("weapon"),n),sample:t}]}),k=R.curry(function(e,r,n,a){var i={},l=c.mark(e),u=a.dangeon,f=a.sample;if(!r)return[t({},e,{}),a];if(void 0===l)throw new Error("Unknown entrance: "+e);var p=s.generate(n,u,f);i[p.id]={place:p};var h={sample:f,dangeon:d.update(p,o.marks[e],u)};return[t({},e,i),h]});return{batchAccum:e,generateDamage:a,pause:l,genWorld:v}}(),v=function(){function e(e,r){var t=e.id,a=r.enemy[t],i=r.player;if(i.health<=0)return[R.assoc("state",o.gameStates.Lose,r),u.pause(n.pause,j)];if(a.health<=0){var l=i.experience+o.enemies[a.type].value,s=c.level(r.player.level),f=R.compose(R.assocPath(["player","experience"],l),A(a))(r);if(f.player.experience>=s.breakpoint){var p=f.player.level+1,h=c.level(p);f.player.level=p,f.player.experience-=s.breakpoint,f.player.power=h.power,f.player.health=h.health}return"boss"===a.type?[R.assoc("state",o.gameStates.Win,r),u.pause(n.pause,j)]:[z(e,f)]}return[r]}function r(r){return function(n){return function(t){var o=r.id,a=t.player.health,i=a-n.enemy,c=R.compose(R.assocPath(["player","health"],i),O(o,n.player));return e(r,c(t))}}}function t(e,r){var n=r.player,t=r.health,a=e.id,i=c.level(n.level).health,u=t[a].type;if(n.health<i){var s=o.health[u],f=n.health+s.health,p=R.compose(R.assocPath(["player","health"],l.align(f,0,i)),R.dissocPath(["health",a]));return[z(e,p(r))]}return[{}]}function i(e,r){var n=r.player,t=e.id,a=function(e){return o.weapons[e].power};if(a(n.weapon)<a(r.weapon[t].type)){var i=R.compose(R.assocPath(["player","weapon"],r.weapon[t].type),R.dissocPath(["weapon",t]));return[z(e,i(r))]}return[z(e,R.dissocPath(["weapon",t],r))]}function p(e,n){var t=n.player,o=n.enemy,a=e.id;return[{},u.generateDamage({player:t,enemy:o[a]},r(e))]}function h(e,r,n){var t=R.merge(n,r[e-1]),o=R.head(R.values(t.entry)).place,a=s.moveRight(o),i=R.assoc("place",a,n.player),c=y.create(e,a);return[R.merge(t,{archive:r,player:i,viewport:c})]}function v(e){var r=R.pick(c.objectsToSave,e),n=R.update(e.floor-1,r,e.archive);return e.archive.length<e.floor+1?a(e.floor+1,n,e.player):h(e.floor+1,n,e)}function m(e){var r=e.floor-1,n=R.merge(e,e.archive[r-1]),t=R.pick(c.objectsToSave,e),o=R.update(r,t,e.archive),a=R.head(R.values(n.exit)).place,i=s.moveRight(a),l=R.assoc("place",i,e.player),u=y.create(r,i);return[R.merge(n,{archive:o,player:l,viewport:u})]}function g(e){return function(r){var n=r.player,o=r.enemy,a=r.health,c=r.weapon,u=r.exit,s=r.entry,h=r.viewport,y=r.state,g=e(n.place),w=g.id,x=R.compose(f.isSpace,d.get(g));return l.isContinues(y)?o[w]?p(g,r):c[w]?i(g,r):a[w]?t(g,r):u[w]?v(r):s[w]?m(r):x(r.dangeon)?[z(g,{player:n,viewport:h})]:[{}]:[{}]}}function w(e){return function(r){return[R.assocPath(["player","place"],e,r)]}}function x(e){return function(){return[e]}}function b(e){return function(){return[{fogDensity:e}]}}function k(e){return[{settings:!e.settings}]}function N(e){return[{lightOn:!e.lightOn}]}var M=function(){return[{}]},S=function(e){return function(r){return function(n){return[R.assoc(e,r,n)]}}},E=new Map;E.set("ArrowUp",g(s.moveUp)),E.set("ArrowDown",g(s.moveDown)),E.set("ArrowLeft",g(s.moveLeft)),E.set("ArrowRight",g(s.moveRight)),E.set("w",g(s.moveUp)),E.set("s",g(s.moveDown)),E.set("a",g(s.moveLeft)),E.set("d",g(s.moveRight));var P=function(e,r){return{viewport:y.update(e,r)}},z=function(e,r){return R.merge(R.assocPath(["player","place"],e,r),P(e,r.viewport))},j=function(){return[{state:o.gameStates.continues},u.pause(300,D)]},D=function(){return a()},A=R.curry(function(e,r){return e.area?R.reduce(function(e,r){return R.dissocPath(["enemy",r.id],e)},r,e.area):R.dissocPath(["enemy",e.place.id],r)}),O=R.curry(function(e,r,n){var t=n.enemy[e],o=t.health-r;return t.area?R.reduce(function(e,r){var n=r.id;return R.assocPath(["enemy",n,"health"],o,e)},n,t.area):R.assocPath(["enemy",e,"health"],o,n)});return{noop:M,keep:S,keepPlayerPlace:w,keyDown:function(e){var r=E.get(e);return void 0===r?M:r},keepWorld:x,changeFogDensity:b,toggleSettings:k,toggleLight:N}}();return{init:a(),render:function(){function t(e){r(v.keyDown(e.key))}function a(e){var r=e.player,n=e.health,t=e.weapon,a=e.enemy,i=e.entry,c=e.exit,l=o.objects,u=d.batch(d.update),s=R.compose(R.map(R.prop("place")),R.values);return R.compose(u(s(n),l.health),u(s(t),l.weapon),u(s(a),l.enemy),u(s(i),l.entry),u(s(c),l.exit),d.update(r.place,l.player))}function i(e){var t=e.floor,a=e.player,i=a.health,l=a.power,u=a.level,s=a.experience,f=o.weapons[a.weapon].power,p=c.level(u),h=p.breakpoint,m=c.level(u).health,d={width:n.viewport.width};return g("div",{className:"info flex-grid rounded stack-level-2",style:d},g("div",{className:"item"},g("h2",{},"Health: "),g("p",{},i+" / "+m)),g("div",{className:"item"},g("h2",{},"Weapon: "),g("p",{},a.weapon)),g("div",{className:"item"},g("h2",{},"Power: "),g("p",{},l+" + "+f)),g("div",{className:"item"},g("h2",{},"Level: "),g("p",{},u.toString())),g("div",{className:"item"},g("h2",{},"Experience: "),g("p",{},s+" / "+h)),g("div",{className:"item"},g("h2",{},"Floor: "),g("p",{},t.toString())),g("div",{className:"item"},g("a",{href:"#",onClick:function(){return r(v.toggleSettings)}},g("i",{className:"ra ra-cog"}))),g("div",{className:"item"},g("a",{href:"#",onClick:function(){return r(v.toggleLight)}},g("i",{className:"ra ra-light-bulb"}))))}function u(e){var r=l.isContinues(e)?"game-ok":"game-over",n=l.isPlayerLose(e)?"You Lose!!!":l.isPlayerWin(e)?"You Win!!!":"";return g("div",{className:"game-state rounded stack-level-2 "+r},g("h2",{},n))}function f(e){var r=e.dangeon,n=e.viewport,t=e.floor,a=e.player,i=e.lightOn,u=c.cellHeight,f=c.cellWidth,p={background:"rgba(0,0,0,"+e.fogDensity/100+")"},h={height:u},v={height:u,width:f};return R.map(function(e){return g("div",{className:"dangeon-row",key:e,style:h},R.map(function(n){var c=s.create(t,n,e),u=o.marks[d.get(c,r)],f=l.isVisible(s.distance(a.place,c));return g("div",{className:"dangeon-cell "+u,key:n,style:v},g("div",{className:i||f?"":"cell-hidden",style:i||f?{}:p}))},R.range(n.p0.x,n.p1.x)))},R.range(n.p0.y,n.p1.y))}function p(e){var n=e;return g("div",{className:"fog-slider flex-grid justify-center"},g("h4",{className:"item"},"Change fog density: "),g("input",{className:"item",type:"range",min:"0",max:"100",value:n,onChange:function(e){return r(v.changeFogDensity(e.target.value))}}))}function h(){return g("div",{className:"hint flex-grid p-std"},g("div",{className:"item"},g("h2",{className:"hint-header"},"player"),g("div",{className:"cell-player hint-cell"})),g("div",{className:"item"},g("h2",{className:"hint-header"},"enemy"),g("div",{className:"cell-enemy hint-cell"})),g("div",{className:"item"},g("h2",{className:"hint-header"},"health"),g("div",{className:"cell-health hint-cell"})),g("div",{className:"item"},g("h2",{className:"hint-header"},"weapon"),g("div",{className:"cell-weapon hint-cell"})),g("div",{className:"item"},g("h2",{className:"hint-header"},"entry"),g("div",{className:"cell-entry hint-cell"})),g("div",{className:"item"},g("h2",{className:"hint-header"},"exit"),g("div",{className:"cell-exit hint-cell"})))}function m(e){return e.settings?g("div",{className:"game-settings rounded stack-level-2"},g("div",{className:"substrate rounded stack-level-2 p-std"},p(e.fogDensity),h(),g("button",{className:"btn-pretty m-auto p-std",onClick:function(){return r(v.toggleSettings)}},"ok"))):null}function y(e){var r=e.dangeon,n=a(e);return R.merge(e,{dangeon:n(r)})}var g=React.createElement,w=function(r){return ReactDOM.render(r,e)};document.body.addEventListener("keydown",t);var x=function(){function e(e){var r={width:n.viewport.width,height:n.viewport.height};return g("div",{className:"game flex-grid flex-column"},i(e),g("div",{className:"game-board flex-grid"},g("div",{className:"dangeon rounded m-auto stack-level-2",style:r},u(e.state),m(e),f(e))))}return{App:e}}();return function(e){var r=y(e),n=x.App;return w(g(n,r))}}()}}var n=(R.curry(function(e,r){return console.log("===================== DEBUG ================"),console.log(e,": ",r),console.log("====================== END ================="),r}),{roomSizeRate:.8,corridorSizeRate:.5,privateArea:2,pause:3e3,sizeOfPreferences:10,dangeonRedundancy:10,minOfEnemies:3,enemiesRate:1.4,healthRate:1.5,visibility:7,viewport:{width:1024,height:624,rows:30,cols:50}}),o=function(){function e(e){var r=e.rows/e.cols,t=Math.ceil(e.rooms/(1+r)),o=Math.ceil(t*r),a={x:Math.ceil(e.cols/t)-1,y:Math.ceil(e.rows/o)-1},i={x:Math.floor(a.x*n.roomSizeRate),y:Math.floor(a.y*n.roomSizeRate)},c=Math.min(i.x,i.y),l=Math.floor(c*n.corridorSizeRate),u=Math.ceil(c/2),s=l<u?l:u;if(n.privateArea>u)throw new Error("Private area size too big!");var f=n.privateArea;return R.merge(e,{zoneSize:a,roomSize:i,corridorSize:s,privateAreaSize:f})}function r(e){var r={};return R.forEach(function(e){r[e]=Symbol(e)},e),r}function t(e,r){return R.compose(R.head,R.keys,R.filter(R.whereEq(e)))}var o=r(["player"]),a=r(["boss"]),i=r(["wall","space"]),c=r(["entry","exit","weapon","health","enemy"]),l=r(["Lose","Win","continues"]),u=R.mergeAll([i,c,a,o]),s={"floor-1":{rows:60,cols:100,rooms:8},"floor-2":{rows:90,cols:120,rooms:10},"floor-3":{rows:120,cols:150,rooms:13},"floor-4":{rows:150,cols:180,rooms:17},"floor-5":{rows:30,cols:50,rooms:3}},f={"level-1":{power:20,breakpoint:120,health:110},"level-2":{power:40,breakpoint:240,health:220},"level-3":{power:80,breakpoint:480,health:440},"level-4":{power:160,breakpoint:960,health:880},"level-5":{power:320,breakpoint:1920,health:1760},"level-6":{power:640,breakpoint:3840,health:3520},"level-7":{power:1280,breakpoint:7680,health:7040},"level-8":{power:2560,breakpoint:15360,health:14080},"level-9":{power:5120,breakpoint:30720,health:28160},"level-10":{power:10240,breakpoint:9999999,health:56320}},p={noWeapon:{power:2,sd:.3},stick:{power:4,sd:.2},cane:{level:1,power:10,sd:.15},"bone knife":{level:2,power:20,sd:.13},"copper dagger":{level:3,power:40,sd:.1},"bronze ax":{level:4,power:80,sd:.08},"simple sword":{level:5,power:160,sd:.05}},h={goblin:{level:1,power:15,health:80,value:20},skeleton:{level:2,power:30,health:160,value:40},gnoll:{level:3,power:60,health:320,value:80},dwarf:{level:4,power:120,health:640,value:160},boss:{level:5,size:2,power:300,health:5e3,value:900}},v={"small potion":{level:1,health:50},potion:{level:2,health:100},"medium potion":{level:3,health:200},"great potion":{level:4,health:400},"grand potion":{level:5,health:800}};return{objects:u,gameBricks:i,gameObjects:c,gameStates:l,hero:o,marks:function(e){var r={};return R.forEach(function(n){r[e[n]]="cell-"+n},R.keys(e)),r}(u),floors:function(r){var n={};return R.forEach(function(t){n[t]=e(r[t])},R.keys(r)),n}(s),levels:f,weapons:p,enemies:h,health:v,findItem:t}}(),c=function(){function e(e){return"Number"===R.type(e)?o.floors["floor-"+e]:o.floors[e]}function r(e){return"Number"===R.type(e)?o.levels["level-"+e]:o.levels[e]}function t(e){if(void 0===o.objects[e])throw new Error("There is no game object for name "+e);return o.marks[o.objects[e]]}return{floor:e,level:r,objectsToSave:function(){return R.concat(R.keys(o.gameObjects),["floor","dangeon"])}(),cellHeight:function(){var e=n.viewport;return Math.floor((e.height-24)/e.rows)}(),cellWidth:function(){var e=n.viewport;return Math.floor((e.width-24)/e.cols)}(),mark:t}}(),l={isVisible:function(e){return e<n.visibility},isPlayerLose:function(e){return e===o.gameStates.Lose},isPlayerWin:function(e){return e===o.gameStates.Win},isContinues:function(e){return e===o.gameStates.continues},align:function(e,r,n){return e<r?r:e>n?n:e}},u=function(){function e(e,r){return e+Math.floor(Math.random()*(r-e))}function r(r){return r[e(0,r.length)]}return{inRange:e,oneFrom:r}}(),s=function(){function e(e,r,n){var t=c.floor(e),o=n*t.cols+r,a=n>=0&&n<=t.rows,i=r>=0&&r<=t.cols;return a&&i?{x:r,y:n,id:o,level:e}:{error:!0}}function r(e,r){return R.compose(R.all(R.equals(!0)),R.map(f.isSpace),d.area(r))}function n(r,n,t){var o=e(t.level,r,n);return o.error?t:o}function t(e,n,o,a){function l(){var a=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,c=u.inRange(p.r1.x,p.r2.x),v=u.inRange(p.r1.y,p.r2.y),m=f(c,v);return r(m,i(m,h))(n)?m:a>100?t(e,n,o,h,s+1):l(a+1)}var s=arguments.length>4&&void 0!==arguments[4]?arguments[4]:0,f=g(e),p=v.random(o),h=a||c.floor(e).privateAreaSize;if(s>50)throw new Error("Can't allocate free space for point");return l()}function o(e,n,a,i,u){var s=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,f=u||c.floor(e).privateAreaSize,p=t(e,n,a,f+i),h=l(p,i,i);if(s>10)throw new Error("Can't allocate free space for area");return r(p,h,n)?h:o(e,n,a,i,f,s+1)}function a(e,r,n,t){var o=n[e]-t,a=n[e]+t+1,i=o<0?0:o,c=a>r?r:a;return R.range(i,c)}function i(r,n){var t=r.level,o=c.floor(t),i=[];return R.forEach(function(c){R.forEach(function(r){return i.push(e(t,r,c))},a("x",o.cols,r,n))},a("y",o.rows,r,n)),i}function l(r,n,t){var o=r.level,a=[];return R.forEach(function(t){R.forEach(function(r){return a.push(e(o,r,t))},R.range(r.x,r.x+n))},R.range(r.y,r.y+t)),a}function s(e,r){return void 0===e?0:void 0===r?0:Math.floor(Math.sqrt(Math.pow(e.x-r.x,2)+Math.pow(e.y-r.y,2)))}var p=function(e){return n(e.x,e.y-1,e)},h=function(e){return n(e.x,e.y+1,e)},m=function(e){return n(e.x-1,e.y,e)},y=function(e){return n(e.x+1,e.y,e)},g=R.curry(function(r,n,t){var o=e(r,n,t);if(o.error)throw new Error("Point 'x:"+n+", y:"+t+"' is out of the borders");return o});return{create:g,moveUp:p,moveDown:h,moveLeft:m,moveRight:y,generate:t,generateArea:o,privateArea:i,distance:s}}(),f=function(){function e(e){if(void 0===R.compose(R.any(function(r){return r===e}),R.keys)(o.objects))throw new Error("Can't create Cell with value: #{value} !");return e}var r=o.gameBricks,n=r.wall,t=r.space;return{create:e,isWall:function(e){return e===n},isSpace:function(e){return e===t}}}(),p=function(){function e(e){return Math.ceil(e.power*(1-3*e.sd))}function r(e){return Math.floor(e.power*(1+3*e.sd))}function n(e){return o.weapons[e]}function t(t){var o=n(t.weapon),a=e(o),i=r(o);return t.power+u.inRange(a,i+1)}return{create:n,randomDamage:t}}(),h=function(){function e(e,r,n,t){return{left:{p1:n,p2:R.assoc(e,r,t)},right:{p1:R.assoc(e,r+1,n),p2:t}}}function r(e,r){var o=r.p1,a=r.p2,i=c.floor(e),l=i.rooms,u=function(e,r){return Math.abs(l-e.rooms)-Math.abs(l-r.rooms)},s=R.compose(R.sort(u),R.times(function(){return t(e,{p1:o,p2:a})}));return R.head(s(n.dangeonRedundancy))}function t(r,o){var a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[],i=o.p1,l=o.p2,s=["x","y"],f=c.floor(r),p=f.zoneSize,h=R.concat(a,s),m=u.oneFrom(h),d="x"===m?"y":"x",y=h.length>n.sizeOfPreferences?[d]:R.append(d,a),g=i[m]+p[m],w=l[m]-p[m];if(g<w){var x=u.inRange(g,w),b=e(m,x,i,l),k=b.left,N=b.right,M=t(r,k,y),S=t(r,N,y);return{axis:m,p1:i,p2:l,left:M,right:S,rooms:M.rooms+S.rooms,size:M.size+S.size}}var E=R.merge(v.create(r,{p1:i,p2:l}),{rooms:1});return R.merge(o,E)}return{create:r}}(),v=function(){function e(e,r){var n=r.p1,t=r.p2,o=c.floor(e),a=o.roomSize,i=u.inRange(n.x+1,t.x-a.x-1),l=u.inRange(n.y+1,t.y-a.y-1),s=u.inRange(i+a.x,t.x-1),f=u.inRange(l+a.y,t.y-1);return{r1:{x:i,y:l},r2:{x:s,y:f},size:(s-i)*(f-l)}}function r(e,r,n){var t=Math.min(e.r1[n],r.r1[n]),o=Math.max(e.r2[n],r.r2[n]),a=e.r2[n]-e.r1[n],i=r.r2[n]-r.r1[n],c=Math.abs(e.r1[n]-r.r1[n]),l=Math.abs(e.r2[n]-r.r2[n]);return{intersection:a+i-o+t,exceeding:Math.max(c,l)}}function n(e,r){var n=r.left,t=r.right;if(e(n.p1,n.p2))return n;if(e(t.p1,t.p2))return t;throw new Error("There is not adjacent zone!")}function t(e,r){return void 0!==r.r1?r:t(e,n(e,r))}function o(e,r){return function(n,t){return"x"===r?n.y===e.y&&t.x+1===e.x:t.x===e.x&&t.y===e.y}}function a(e,r){return function(n,t){return"x"===r?n.x===e.x&&n.y===e.y:n.y-1===e.y&&t.x===e.x}}function i(e){var r=e.axis,n=e.left,i=e.right;if(void 0!==e.r1)return e;var c="x"===r?i.p1:n.p2,l=o(c,r),u=a(c,r);return{left:t(l,n),right:t(u,i)}}function l(e){if(void 0!==e.r1)return e;var r=e.left,n=e.right;return l(u.inRange(0,r.size+n.size)<r.size?r:n)}return{create:e,neighbors:i,relativePosition:r,random:l}}(),m=function(){function e(e,r,n,t){var o="x"===e?n:r,a="x"===e?r:n;return d.fill(o,a,t)}function r(e,r,n){var t=e/2,o=r+Math.ceil((n-r)/2);return{p1:o-Math.ceil(t),p2:o+Math.floor(t)}}function n(n,t,a,i){var c="x"===n?"y":"x",l=Math.max(a.r1[n],i.r1[n]),u=Math.min(a.r2[n],i.r2[n]),s=r(t,l,u),f=s.p1,p=s.p2;return e(n,R.range(f,p),R.range(a.r2[c],i.r1[c]),o.objects.space)}function t(r,n,t,a,i){var c="x"===r?"y":"x",l=R.range(t.p1,t.p2),u=R.range(i.p1,i.p2),s=n.r1[c]>i.p1?R.range(i.p1,n.r1[c]):R.range(n.r2[c],i.p1),f=t.p1<a.r1[r]?R.range(t.p1,a.r1[r]):R.range(a.r2[r],t.p2);return R.pipe(e(r,l,s,o.objects.space),e(c,u,f,o.objects.space))}function a(e,n,o,a){var i="x"===e?"y":"x";if("y"===e){var c=a.r1[e]<o.r1[e]?a:o,l=c===a?o:a;return t(e,c,r(n,c.r1[e],Math.min(c.r2[e],l.r1[e]-1)),l,r(n,l.r1[i],l.r2[i]))}var u=o.r2[e]>a.r2[e]?o:a,s=u===o?a:o;return t(e,u,r(n,u.r2[e],Math.max(u.r1[e],s.r2[e]+1)),s,r(n,s.r1[i],s.r2[i]))}function i(e,r,t){var o=t.left,i=t.right,l="x"===r?"y":"x",u=v.relativePosition(o,i,l),s=c.floor(e).corridorSize;return u.intersection>s?n(l,s,o,i):u.exceeding>s?a(l,s,o,i):{error:!0}}return{create:i}}(),d=function(){function e(e){var r=e.rows,n=e.cols;return R.compose(R.repeat(R.__,r),R.repeat(R.__,n))(o.objects.wall)}function r(e,r,n,t){return R.reduce(function(r,t){return e(t,n,r)},t,r)}function n(e,r,n){if(void 0===e)return n;if(R.compose(f.isWall,l(e))(n))throw new Error("Position 'x:"+e.x+", y:"+e.y+"' is occupied by a wall.");return t(e,r,n)}function t(e,r,n){var t=n.concat(),o=n[e.y].concat();return o[e.x]=r,t[e.y]=o,t}function a(e,r,n,t){var o=t.concat();return R.forEach(function(e){var t=o[e].concat();R.forEach(function(e){t[e]=n},r),o[e]=t},e),o}function i(e,r,n){var t=r.axis,c=r.r1,l=r.r2,u=r.left,s=r.right;if(n.error)return n;if(void 0!==c){return a(R.range(c.y,l.y),R.range(c.x,l.x),o.objects.space,n)}var f=i(e,u,i(e,s,n)),p=m.create(e,t,v.neighbors(r));return f.error||p.error?{error:!0}:p(f)}function c(e,r){return R.map(l(R.__,r),e)}var l=R.curry(function(e,r){return r[e.y][e.x]});return{create:e,get:l,set:R.curry(t),update:R.curry(n),batch:R.curry(r),fill:R.curry(a),fromSample:R.curry(i),area:R.curry(c)}}(),y=function(){function e(e,o){var a=c.floor(e),i={cols:R.min(n.viewport.cols,a.cols),rows:R.min(n.viewport.rows,a.rows)};return void 0===o?r(e,a,i):t(e,a,i,o)}function r(e,r,n){var t=r.cols,o=r.rows,a=Math.floor(t/2),i=Math.floor(o/2),c=Math.floor(n.cols/2),l=Math.floor(n.rows/2);return{p0:s.create(e)(a-c,i-l),p1:s.create(e)(a+(n.cols-c),i+(n.rows-l))}}function t(e,r,n,t){var a=r.cols,c=r.rows,l=Math.round(n.cols/2),u=Math.round(n.rows/2),f=s.create(e),p=t.x-l,h=t.x+(n.cols-l),v=t.y-u,m=t.y+(n.rows-u),d=o(p,h,0,a),y=i(d,2),g=y[0],R=y[1],w=o(v,m,0,c),x=i(w,2),b=x[0],k=x[1];return{p0:f(g,b),p1:f(R,k)}}function o(e,r,n,t){return e<n?[n,r-e]:r>t?[e-(r-t),t]:[e,r]}function a(e,r){var n=r.p0,t=r.p1;return{p0:e(n),p1:e(t)}}function l(e,r){var t=c.floor(e.level),o=t.rows,i=t.cols,l=n.visibility;return e.x>=l&&e.x-r.p0.x<l?a(s.moveLeft,r):e.x<i-l&&r.p1.x-e.x<l?a(s.moveRight,r):e.y>=l&&e.y-r.p0.y<l?a(s.moveUp,r):e.y<o-l&&r.p1.y-e.y<l?a(s.moveDown,r):r}return{create:e,update:l}}();(function(){R.compose(a.a.start,r)(a.a.send)})()}(document.getElementById("app-container"))},function(e,r){},function(e,r,n){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var t=n(1);n.n(t),n(0)},function(e,r,n){var t,o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};!function(){function a(e){return s(e)}function i(e){function r(e,r){var n=r[0],t=r[1]||[],o=l(e,n),a=o[0],i=o[1]||[];return[a,t.concat(i)]}return function(n){var t=e.reduce(r,[n,[]]),o=function(){var e=t[1];e.length>0&&e.forEach(function(e){e()})};return[t[0],o]}}function c(e,r){return Object.assign({},e,r)}function l(e,r){if(void 0===e)throw new Error("Undefined action");if("function"!=typeof e)throw new Error("Improper Action: "+e);var n=e(r),t=n[0],o=n[1];return 0===Object.keys(t).length?[r,o]:[c(r,t),o]}function u(e){function r(e){return function(r){return n(l(r,e),e)}}function n(e,n){var t=e[0],a=e[1];return s=r(t),t!==n&&o(t),void 0!==a&&a(),t}var t=e.init,o=e.render;return n(t)}var s=function(e){return e},f={start:u,send:a,batch:i};"object"===o(r)?e.exports=f:void 0!==(t=function(){return f}.call(r,n,r,e))&&(e.exports=t)}()}]);