// function to transforme a string into a number (and put a default value to NaN number)
export default function atoi(str_nbr: string, default_value: number = 10): number {
    return Number.isNaN(+str_nbr) ? default_value : +str_nbr;
}
