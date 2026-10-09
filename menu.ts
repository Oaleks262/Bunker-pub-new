import original from './original-menu.js';
export type Item = {id:string; name:string; about:string; volume:string; price:number; category:string; available:boolean; hidden?:boolean};
export const categories = ['Гарячі страви','Дошки','Своя дошка','Соуси','Коктейлі','Залпові коктейлі','Сети','Алкогольні напої','Вино','Безалкогольні напої'];
const groups: [string,string][] = [['falseDataHotDishes','Гарячі страви'],['falseDataSnacks','Дошки'],['falseDataBeerBoard','Своя дошка'],['falseDataSauces','Соуси'],['falseDataCoctel','Коктейлі'],['falseDataFireDrink','Залпові коктейлі'],['falseDataShota','Сети'],['falseDataAlcohol','Алкогольні напої'],['falseDataVine','Вино'],['falseDataFreeDrink','Безалкогольні напої']];
export const initialMenu:Item[] = groups.flatMap(([key,category])=>(original as any)[key].filter((x:any)=>x.name).map((x:any,i:number)=>({id:key+'-'+i,name:x.name,about:x.about||'',volume:x.volume+(key==='falseDataBeerBoard'&&!x.isCustomVolume?' г':''),price:parseInt(x.price),category,available:true})));
export const money=(n:number)=>new Intl.NumberFormat('uk-UA').format(n)+' ₴';
export const statusNames:Record<string,string>={new:'Очікує підтвердження',accepted:'Прийнято',preparing:'Готується',ready:'Готове',completed:'Завершено',cancelled:'Скасовано'};
