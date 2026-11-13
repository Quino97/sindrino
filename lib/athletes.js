export const isPlaceholder = athlete => athlete.placeholder === true;
export function athleteInitials(name) {
  return String(name).trim().split(/\s+/).filter(Boolean).slice(0,2).map(part=>Array.from(part)[0]).join('').toUpperCase();
}
export function filterAthletes(athletes, discipline = 'all') {
  return discipline === 'all' ? athletes : athletes.filter(a=>!isPlaceholder(a)&&a.discipline===discipline);
}
