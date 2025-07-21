export function get_enemy_pkmn_styles(pkmnData) {
    const isFainted = pkmnData?.hp.value == 0;
    return {
      faint: isFainted
        ? "filter: drop-shadow(2px 2px 2px #000) saturate(1.3) grayscale(100%); opacity: .5;"
        : "filter: drop-shadow(2px 2px 2px #000) saturate(1.3) grayscale(0%);",
      faint_stats_background: isFainted
        ? "filter: grayscale(100%); opacity: .3;"
        : "filter: grayscale(0%);",
      faintStats: isFainted
        ? "filter: grayscale(100%); opacity: .4;"
        : "filter: grayscale(0%);",
      text: isFainted ? "opacity: .3" : "",
      species: isFainted ? "opacity: .3" : "opacity: .7"
    };
}
