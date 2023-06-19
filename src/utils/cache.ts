/**
 * Local Cache for checking the seat reservation in process
 * 
 * This can be replaced with a central cache implementation like redis 
 * when multiple instaces are required.
 * 
 * 
 * 
 * */

const cinemaCache = new Map<String, number[]>();
function checkSeatCinemaInCache(cinemaId: string, seatNo: number): boolean {
    //Cinema not present in the cache
    if (!cinemaCache.has(cinemaId)) return false;
    // Seat is present in the cache
    else if (cinemaCache.get(cinemaId).indexOf(seatNo) !== -1) return true;
    // Seat is not present in the cache
    else return false;
}

function addSeatCinema(cinemaId: string, seatNo: number) {
    //Cinema not present in the cache
    if (!cinemaCache.has(cinemaId)) cinemaCache.set(cinemaId, [seatNo]);
    // Cinema is present in the cache
    else cinemaCache.get(cinemaId).push(seatNo);
}

export { checkSeatCinemaInCache, addSeatCinema }
