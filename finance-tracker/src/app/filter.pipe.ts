import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(value: any[], search: string): any[] {
    const list = Array.isArray(value) ? value.slice() : [];
    const q = (search || '').toLowerCase().trim();
    if (!q) return list;
    const picked: any[] = [];
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const name = item && item.name ? String(item.name) : '';
      const desc = item && item.description ? String(item.description) : '';
      const blob = (name + ' ' + desc).toLowerCase();
      if (blob.indexOf(q) !== -1) picked.push(item);
    }
    return picked;
  }
}
