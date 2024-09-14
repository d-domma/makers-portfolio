import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(value: any[], search: string): any[] {
    if (!search) return value;
    return value.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  }
}
