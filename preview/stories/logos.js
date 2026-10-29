/* six story logos, drawn as 24x24 line icons (stroke=currentColor) */
const LG={
recap:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18a8 8 0 0 1 16 0"/><path d="M12 10v8M7.2 12.2 12 18M16.8 12.2 12 18"/><path d="M12 3v2.2M4.6 6.2l1.5 1.5M19.4 6.2l-1.5 1.5M2 18h20"/></svg>`,
waiver:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6z"/></svg>`,
weekly:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M9.5 13h5l-3 5"/></svg>`,
totw:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4.5a2.5 2.5 0 0 0 2.6 3.6M17 6h2.5a2.5 2.5 0 0 1-2.6 3.6M12 14v3.5M8.5 20.5h7M9.5 17.5h5"/></svg>`,
totm:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8l4 4 4.5-6.5 4.5 6.5 4-4-1.8 10H5.3z"/><path d="M5.3 20.5h13.4"/><circle cx="12" cy="13.6" r="1.3" fill="currentColor"/></svg>`,
notes:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3.5h10l4 4v13H5z"/><path d="M15 3.5v4h4M8.5 11h7M8.5 14.5h7M8.5 18h4"/></svg>`};
const ST=[
{k:"recap",n:"Daily Recap",s:"Recap",c:"#ffc62b",c2:"#ff7a00",new:1,pg:5},
{k:"waiver",n:"Waiver Wire",s:"Waivers",c:"#3fe07a",c2:"#00b3a4",new:1,pg:4},
{k:"weekly",n:"Weekly Recap",s:"Weekly",c:"#4aa8ff",c2:"#6b5bff",new:1,pg:6},
{k:"totw",n:"Team of the Week",s:"TOTW",c:"#ff6b3d",c2:"#ff2d7a",new:0,pg:3},
{k:"totm",n:"Team of the Month",s:"TOTM",c:"#c79bff",c2:"#ffcf5a",new:1,pg:3},
{k:"notes",n:"Josh Lloyd's Notes",s:"JL Notes",c:"#5ff0e0",c2:"#2a9dff",new:0,pg:2}];
