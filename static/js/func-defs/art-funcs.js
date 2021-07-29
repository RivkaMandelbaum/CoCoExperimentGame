/* -------------------------------------------------------------------------- */
/* Functions that deal with artworks.                                         */
/* Author: Rivka Mandelbaum                                                   */
/* Bai edits */
/* -------------------------------------------------------------------------- */

// creates Artwork objects to return (helper to getArtworks)
function Artwork(name, id, filepath, value) { 
    this.name = name;
    this.id = id;
    this.filepath = filepath;
    this.value = value;
}

// create array of images with randomized position and add positions to dictionary
// for choices (if not copying) or stimulus (if copying) in art display rounds
async function artArray(add_img_tag, curr_index) { 
    const img_array = await getArtworks(offlineMode, numExecutions);
    const len = img_array.length; 

    // create a dictionary of shuffled positions F
    let arr = [];
    for(let i = 0; i < len; i++) arr.push(i);
    let shuffled = jsPsych.randomization.shuffle(arr);
    
    // add images to array in order they will appear
    let order = []; 
    for(let i = 0; i < len; i++) { 
        pos = shuffled[i];
        
        if (add_img_tag) arr[i] = `<img src = ${img_array[pos].filepath}></img>`;
        else arr[i] = img_array[pos].filepath;

        // save the order
        order.push(img_array[pos]);
    }

    // save the current order to the global object
    orderLookup[curr_index] = order;

    return arr;
} 

// returns a random artwork from the given trial
function rand_art(trial_index) { 
    let random_choice = Math.floor((Math.random() * NUM_IMAGES));
    let arts = getDataAtIndex(trial_index).order;
    return arts[random_choice];
}


// returns hard-coded artworks
// original values are at the end of the file name and transferred values are entered.
// $69 = $1 ~ $159 = $10.
// shorter version. trial num = 9
// function offlineArts(round) {
//     let all_arts = [{ name: "KnowingCalm_69", id: 0, filepath: "../static/images/artworks/KnowingCalm_69.jpeg", value: 1},
//     { name: "ScalingColors_69", id: 1, filepath: "../static/images/artworks/ScalingColors_69.jpeg", value: 1},
//     { name: "PhoneCalls_79", id: 2, filepath: "../static/images/artworks/PhoneCalls_79.jpeg", value: 2},
//     { name: "WrappedUp_79", id: 3, filepath: "../static/images/artworks/WrappedUp_79.jpeg", value: 2},
//     { name: "NoahsArk_79", id: 4, filepath: "../static/images/artworks/NoahsArk_79.jpeg", value: 2},
//     { name: "GhostMonster_69", id: 5, filepath: "../static/images/artworks/GhostMonster_69.jpeg", value: 1},
//     { name: "DismemberedEnthusiast_79", id: 6, filepath: "../static/images/artworks/DismemberedEnthusiast_79.jpeg", value: 2},
//     { name: "RunningFromHome_129", id: 7, filepath: "../static/images/artworks/RunningFromHome_129.jpeg", value: 7},
//     { name: "InitialSpark_149", id: 8, filepath: "../static/images/artworks/InitialSpark_149.jpeg", value: 9},
//     { name: "Composition_159", id: 9, filepath: "../static/images/artworks/Composition_159.jpeg", value: 10},
//     { name: "DeananAwsen_79", id: 10, filepath: "../static/images/artworks/DeananAwsen_79.jpeg", value: 2},
//     { name: "EvelynDarkeyes_99", id: 11, filepath: "../static/images/artworks/EvelynDarkeyes_99.jpeg", value: 4},
//     { name: "RelaxInWoods_129", id: 12, filepath: "../static/images/artworks/RelaxInWoods_129.jpeg", value: 7},
//     { name: "FarmBoy_149", id: 13, filepath: "../static/images/artworks/FarmBoy_149.jpeg", value: 9},
//     { name: "PaulineIngido_159", id: 14, filepath: "../static/images/artworks/PaulineIngido_159.jpeg", value: 10},
//     { name: "AsYouWere_79", id: 15, filepath: "../static/images/artworks/AsYouWere_79.jpeg", value: 2},
//     { name: "ListedEmotions_99", id: 16, filepath: "../static/images/artworks/ListedEmotions_99.jpeg", value: 4},
//     { name: "StreamOfOne_129", id: 17, filepath: "../static/images/artworks/StreamOfOne_129.jpeg", value: 7},
//     { name: "RulesOfDesign_149", id: 18, filepath: "../static/images/artworks/RulesOfDesign_149.jpeg", value: 9},
//     { name: "BeyondMusic_159", id: 19, filepath: "../static/images/artworks/BeyondMusic_159.jpeg", value: 10},
//     { name: "HearingWinds_129", id: 20, filepath: "../static/images/artworks/HearingWinds_129.jpeg", value: 7},
//     { name: "Spa_149", id: 21, filepath: "../static/images/artworks/Spa_149.jpeg", value: 9},
//     { name: "TheFullView_99", id: 22, filepath: "../static/images/artworks/TheFullView_99.jpeg", value: 4},
//     { name: "JulyAugust_89", id: 23, filepath: "../static/images/artworks/JulyAugust_89.jpeg", value: 3},
//     { name: "Nights_69", id: 24, filepath: "../static/images/artworks/Nights_69.jpeg", value: 1},
//     { name: "ViennaIsWaiting_69", id: 25, filepath: "../static/images/artworks/ViennaIsWaiting_69.jpeg", value: 1},
//     { name: "Lascaux_129", id: 26, filepath: "../static/images/artworks/Lascaux_129.jpeg", value: 7},
//     { name: "ForcefulLiving_159", id: 27, filepath: "../static/images/artworks/ForcefulLiving_159.jpeg", value: 10},
//     { name: "NirvanasGates_99", id: 28, filepath: "../static/images/artworks/NirvanasGates_99.jpeg", value: 4},
//     { name: "BedOfBoats_79", id: 29, filepath: "../static/images/artworks/BedOfBoats_79.jpeg", value: 2},
//     { name: "PointlessVisitor_149", id: 30, filepath: "../static/images/artworks/PointlessVisitor_149.jpeg", value: 9},
//     { name: "Wrecks_99", id: 31, filepath: "../static/images/artworks/Wrecks_99.jpeg", value: 4},
//     { name: "HidingTime_89", id: 32, filepath: "../static/images/artworks/HidingTime_89.jpeg", value: 3},
//     { name: "DevelopmentalViews_129", id: 33, filepath: "../static/images/artworks/DevelopmentalViews_129.jpeg", value: 7},
//     { name: "OneSidedConversations_149", id: 34, filepath: "../static/images/artworks/OneSidedConversations_149.jpeg", value: 9},
//     { name: "BlowingIce_69", id: 35, filepath: "../static/images/artworks/BlowingIce_69.jpeg", value: 1},
//     { name: "BrendaBooker_79", id: 36, filepath: "../static/images/artworks/BrendaBooker_79.jpeg", value: 2},
//     { name: "CreepyCrawler_99", id: 37, filepath: "../static/images/artworks/CreepyCrawler_99.jpeg", value: 4},
//     { name: "BleedingBoat_129", id: 38, filepath: "../static/images/artworks/BleedingBoat_129.jpeg", value: 7},
//     { name: "CaveMasters_149", id: 39, filepath: "../static/images/artworks/CaveMasters_149.jpeg", value: 9},
//     { name: "FloatingLust_149", id: 40, filepath: "../static/images/artworks/FloatingLust_149.jpeg", value: 9},
//     { name: "Illuminate_79", id: 41, filepath: "../static/images/artworks/Illuminate_79.jpeg", value: 2},
//     { name: "Tattoo_99", id: 42, filepath: "../static/images/artworks/Tattoo_99.jpeg", value: 4},
//     { name: "SoFarUp_129", id: 43, filepath: "../static/images/artworks/SoFarUp_129.jpeg", value: 7},
//     { name: "ItStillHurts_149", id: 44, filepath: "../static/images/artworks/ItStillHurts_149.jpeg", value: 9},
//     { name: "FlowersWithJam_129", id: 45, filepath: "../static/images/artworks/FlowersWithJam_129.jpeg", value: 7},
//     { name: "FloraOverflow_149", id: 46, filepath: "../static/images/artworks/FloraOverflow_149.jpeg", value: 9},
//     { name: "BrainFlowers_99", id: 47, filepath: "../static/images/artworks/BrainFlowers_99.jpeg", value: 4},
//     { name: "AirbrushedFlowers_79", id: 48, filepath: "../static/images/artworks/AirbrushedFlowers_79.jpeg", value: 2},
//     { name: "OptimisticFlowers_159", id: 49, filepath: "../static/images/artworks/OptimisticFlowers_159.jpeg", value: 10}
//     ];

// longer version. trial num = 19
function offlineArts(round) {
    let all_arts = [{name: "AirbrushedFlowers_79.jpeg", id: 1, filepath: "../static/images/artworks/AirbrushedFlowers_79.jpeg", value: 2},
{name: "AsYouWere_79.jpeg", id: 2, filepath: "../static/images/artworks/AsYouWere_79.jpeg", value: 2},
{name: "BedOfBoats_79.jpeg", id: 3, filepath: "../static/images/artworks/BedOfBoats_79.jpeg", value: 2},
{name: "BeyondMusic_159.jpeg", id: 4, filepath: "../static/images/artworks/BeyondMusic_159.jpeg", value: 10},
{name: "BleedingBoat_129.jpeg", id: 5, filepath: "../static/images/artworks/BleedingBoat_129.jpeg", value: 7},
{name: "BlowingIce_69.jpeg", id: 6, filepath: "../static/images/artworks/BlowingIce_69.jpeg", value: 1},
{name: "BrainFlowers_99.jpeg", id: 7, filepath: "../static/images/artworks/BrainFlowers_99.jpeg", value: 4},
{name: "BrendaBooker_79.jpeg", id: 8, filepath: "../static/images/artworks/BrendaBooker_79.jpeg", value: 2},
{name: "CaveMasters_149.jpeg", id: 9, filepath: "../static/images/artworks/CaveMasters_149.jpeg", value: 9},
{name: "Composition_159.jpeg", id: 10, filepath: "../static/images/artworks/Composition_159.jpeg", value: 10},
{name: "CreepyCrawler_99.jpeg", id: 11, filepath: "../static/images/artworks/CreepyCrawler_99.jpeg", value: 4},
{name: "DeananAwsen_79.jpeg", id: 12, filepath: "../static/images/artworks/DeananAwsen_79.jpeg", value: 2},
{name: "DevelopmentalViews_129.jpeg", id: 13, filepath: "../static/images/artworks/DevelopmentalViews_129.jpeg", value: 7},
{name: "DismemberedEnthusiast_79.jpeg", id: 14, filepath: "../static/images/artworks/DismemberedEnthusiast_79.jpeg", value: 2},
{name: "EvelynDarkeyes_99.jpeg", id: 15, filepath: "../static/images/artworks/EvelynDarkeyes_99.jpeg", value: 4},
{name: "FarmBoy_149.jpeg", id: 16, filepath: "../static/images/artworks/FarmBoy_149.jpeg", value: 9},
{name: "FloatingLust_149.jpeg", id: 17, filepath: "../static/images/artworks/FloatingLust_149.jpeg", value: 9},
{name: "FloraOverflow_149.jpeg", id: 18, filepath: "../static/images/artworks/FloraOverflow_149.jpeg", value: 9},
{name: "FlowersWithJam_129.jpeg", id: 19, filepath: "../static/images/artworks/FlowersWithJam_129.jpeg", value: 7},
{name: "ForcefulLiving_159.jpeg", id: 20, filepath: "../static/images/artworks/ForcefulLiving_159.jpeg", value: 10},
{name: "GhostMonster_69.jpeg", id: 21, filepath: "../static/images/artworks/GhostMonster_69.jpeg", value: 1},
{name: "HearingWinds_129.jpeg", id: 22, filepath: "../static/images/artworks/HearingWinds_129.jpeg", value: 7},
{name: "HidingTime_89.jpeg", id: 23, filepath: "../static/images/artworks/HidingTime_89.jpeg", value: 3},
{name: "Illuminate_79.jpeg", id: 24, filepath: "../static/images/artworks/Illuminate_79.jpeg", value: 2},
{name: "InitialSpark_149.jpeg", id: 25, filepath: "../static/images/artworks/InitialSpark_149.jpeg", value: 9},
{name: "ItStillHurts_149.jpeg", id: 26, filepath: "../static/images/artworks/ItStillHurts_149.jpeg", value: 9},
{name: "JulyAugust_89.jpeg", id: 27, filepath: "../static/images/artworks/JulyAugust_89.jpeg", value: 3},
{name: "KnowingCalm_69.jpeg", id: 28, filepath: "../static/images/artworks/KnowingCalm_69.jpeg", value: 1},
{name: "Lascaux_129.jpeg", id: 29, filepath: "../static/images/artworks/Lascaux_129.jpeg", value: 7},
{name: "ListedEmotions_99.jpeg", id: 30, filepath: "../static/images/artworks/ListedEmotions_99.jpeg", value: 4},
{name: "Nights_69.jpeg", id: 31, filepath: "../static/images/artworks/Nights_69.jpeg", value: 1},
{name: "NirvanasGates_99.jpeg", id: 32, filepath: "../static/images/artworks/NirvanasGates_99.jpeg", value: 4},
{name: "NoahsArk_79.jpeg", id: 33, filepath: "../static/images/artworks/NoahsArk_79.jpeg", value: 2},
{name: "OneSidedConversations_149.jpeg", id: 34, filepath: "../static/images/artworks/OneSidedConversations_149.jpeg", value: 9},
{name: "OptimisticFlowers_159.jpeg", id: 35, filepath: "../static/images/artworks/OptimisticFlowers_159.jpeg", value: 10},
{name: "PaulineIngido_159.jpeg", id: 36, filepath: "../static/images/artworks/PaulineIngido_159.jpeg", value: 10},
{name: "PhoneCalls_79.jpeg", id: 37, filepath: "../static/images/artworks/PhoneCalls_79.jpeg", value: 2},
{name: "PointlessVisitor_149.jpeg", id: 38, filepath: "../static/images/artworks/PointlessVisitor_149.jpeg", value: 9},
{name: "RelaxInWoods_129.jpeg", id: 39, filepath: "../static/images/artworks/RelaxInWoods_129.jpeg", value: 7},
{name: "RulesOfDesign_149.jpeg", id: 40, filepath: "../static/images/artworks/RulesOfDesign_149.jpeg", value: 9},
{name: "RunningFromHome_129.jpeg", id: 41, filepath: "../static/images/artworks/RunningFromHome_129.jpeg", value: 7},
{name: "ScalingColors_69.jpeg", id: 42, filepath: "../static/images/artworks/ScalingColors_69.jpeg", value: 1},
{name: "SoFarUp_129.jpeg", id: 43, filepath: "../static/images/artworks/SoFarUp_129.jpeg", value: 7},
{name: "Spa_149.jpeg", id: 44, filepath: "../static/images/artworks/Spa_149.jpeg", value: 9},
{name: "StreamOfOne_129.jpeg", id: 45, filepath: "../static/images/artworks/StreamOfOne_129.jpeg", value: 7},
{name: "Tattoo_99.jpeg", id: 46, filepath: "../static/images/artworks/Tattoo_99.jpeg", value: 4},
{name: "TheFullView_99.jpeg", id: 47, filepath: "../static/images/artworks/TheFullView_99.jpeg", value: 4},
{name: "ViennaIsWaiting_69.jpeg", id: 48, filepath: "../static/images/artworks/ViennaIsWaiting_69.jpeg", value: 1},
{name: "WrappedUp_79.jpeg", id: 49, filepath: "../static/images/artworks/WrappedUp_79.jpeg", value: 2},
{name: "Wrecks_99.jpeg", id: 50, filepath: "../static/images/artworks/Wrecks_99.jpeg", value: 4},
{name: "AnEndlessNight_149.jpeg", id: 51, filepath: "../static/images/artworks/AnEndlessNight_149.jpeg", value: 9},
{name: "SeeingFaces_149.jpeg", id: 52, filepath: "../static/images/artworks/SeeingFaces_149.jpeg", value: 9},
{name: "SoftDreams_149.jpeg", id: 53, filepath: "../static/images/artworks/SoftDreams_149.jpeg", value: 9},
{name: "SunnySideGrass_129.jpeg", id: 54, filepath: "../static/images/artworks/SunnySideGrass_129.jpeg", value: 7},
{name: "TheClearBlue_129.jpeg", id: 55, filepath: "../static/images/artworks/TheClearBlue_129.jpeg", value: 7},
{name: "ShiningBeauty_129.jpeg", id: 56, filepath: "../static/images/artworks/ShiningBeauty_129.jpeg", value: 7},
{name: "StrawberryFields_99.jpeg", id: 57, filepath: "../static/images/artworks/StrawberryFields_99.jpeg", value: 4},
{name: "FilteredLove_99.jpeg", id: 58, filepath: "../static/images/artworks/FilteredLove_99.jpeg", value: 4},
{name: "Daydreaming_99.jpeg", id: 59, filepath: "../static/images/artworks/Daydreaming_99.jpeg", value: 4},
{name: "ChokingBlack_79.jpeg", id: 60, filepath: "../static/images/artworks/ChokingBlack_79.jpeg", value: 2},
{name: "CarryingWater_79.jpeg", id: 61, filepath: "../static/images/artworks/CarryingWater_79.jpeg", value: 2},
{name: "KeepingEast_69.jpeg", id: 62, filepath: "../static/images/artworks/KeepingEast_69.jpeg", value: 1},
{name: "PassionateTime_79.jpeg", id: 63, filepath: "../static/images/artworks/PassionateTime_79.jpeg", value: 2},
{name: "Imprisonment_59.jpeg", id: 64, filepath: "../static/images/artworks/Imprisonment_59.jpeg", value: 2},
{name: "GlossyAir_159.jpeg", id: 65, filepath: "../static/images/artworks/GlossyAir_159.jpeg", value: 10},
{name: "TheSmithsSisters_79.jpeg", id: 66, filepath: "../static/images/artworks/TheSmithsSisters_79.jpeg", value: 2},
{name: "ShinBanally_79.jpeg", id: 67, filepath: "../static/images/artworks/ShinBanally_79.jpeg", value: 2},
{name: "TheChosenOne_79.jpeg", id: 68, filepath: "../static/images/artworks/TheChosenOne_79.jpeg", value: 2},
{name: "MissAnnabella_99.jpeg", id: 69, filepath: "../static/images/artworks/MissAnnabella_99.jpeg", value: 4},
{name: "RulingGlenda_99.jpeg", id: 70, filepath: "../static/images/artworks/RulingGlenda_99.jpeg", value: 4},
{name: "CrowningJames_99.jpeg", id: 71, filepath: "../static/images/artworks/CrowningJames_99.jpeg", value: 4},
{name: "RunawayBride_149.jpeg", id: 72, filepath: "../static/images/artworks/RunawayBride_149.jpeg", value: 9},
{name: "OfUnity_149.jpeg", id: 73, filepath: "../static/images/artworks/OfUnity_149.jpeg", value: 9},
{name: "ClappingLad_149.jpeg", id: 74, filepath: "../static/images/artworks/ClappingLad_149.jpeg", value: 9},
{name: "NoBrainerJoseph_69.jpeg", id: 75, filepath: "../static/images/artworks/NoBrainerJoseph_69.jpeg", value: 1},
{name: "WakingtheBear_69.jpeg", id: 76, filepath: "../static/images/artworks/WakingtheBear_69.jpeg", value: 1},
{name: "Emilliard_69.jpeg", id: 77, filepath: "../static/images/artworks/Emilliard_69.jpeg", value: 1},
{name: "DrAsh_129.jpeg", d: 78, filepath: "../static/images/artworks/DrAsh_129.jpeg", value: 7},
{name: "MaliaOpium_129.jpeg", id: 79, filepath: "../static/images/artworks/MaliaOpium_129.jpeg", value: 7},
{name: "SortingJames_129.jpeg", id: 80, filepath: "../static/images/artworks/SortingJames_129.jpeg", value: 7},
{name: "LonglyAtHeart_99.jpeg", id: 81, filepath: "../static/images/artworks/LonglyAtHeart_99.jpeg", value: 4},
{name: "NotLongAgo_99.jpeg", id: 82, filepath: "../static/images/artworks/NotLongAgo_99.jpeg", value: 4},
{name: "CrossingTales_119.jpeg", id: 83, filepath: "../static/images/artworks/CrossingTales_119.jpeg", value: 6},
{name: "GariousTruth_119.jpeg", id: 84, filepath: "../static/images/artworks/GariousTruth_119.jpeg", value: 6},
{name: "DeepDreams_119.jpeg", id: 85, filepath: "../static/images/artworks/DeepDreams_119.jpeg", value: 6},
{name: "WhisperingSounds_99.jpeg", id: 86, filepath: "../static/images/artworks/WhisperingSounds_99.jpeg", value: 4},
{name: "FairGame_79.jpeg", id: 87, filepath: "../static/images/artworks/FairGame_79.jpeg", value: 2},
{name: "GroundingRed_79.jpeg", id: 88, filepath: "../static/images/artworks/GroundingRed_79.jpeg", value: 2},
{name: "LoggedIntoHumanity_79.jpeg", id: 89, filepath: "../static/images/artworks/LoggedIntoHumanity_79.jpeg", value: 2},
{name: "AgreeingLost_159.jpeg", id: 90, filepath: "../static/images/artworks/AgreeingLost_159.jpeg", value: 10},
{name: "WalkingMazes_159.jpeg", id: 91, filepath: "../static/images/artworks/WalkingMazes_159.jpeg", value: 10},
{name: "CraftedShapes_159.jpeg", id: 92, filepath: "../static/images/artworks/CraftedShapes_159.jpeg", value: 10},
{name: "NextGen_139.jpeg", id: 93, filepath: "../static/images/artworks/NextGen_139.jpeg", value: 8},
{name: "InsideTheVoid_139.jpeg", id: 94, filepath: "../static/images/artworks/InsideTheVoid_139.jpeg", value: 8},
{name: "IcyFeel_139.jpeg", id: 95, filepath: "../static/images/artworks/IcyFeel_139.jpeg", value: 8},
{name: "WutheringHeight_89.jpeg", id: 96, filepath: "../static/images/artworks/WutheringHeight_89.jpeg", value: 3},
{name: "SatinsOfLife_69.jpeg", id: 97, filepath: "../static/images/artworks/SatinsOfLife_69.jpeg", value: 1},
{name: "StickyWaves_69.jpeg", id: 98, filepath: "../static/images/artworks/StickyWaves_69.jpeg", value: 1},
{name: "FloatingClouds_79.jpeg", id: 99, filepath: "../static/images/artworks/FloatingClouds_79.jpeg", value: 2},
{name: "AllKnowingNothing_79.jpeg", id: 100, filepath: "../static/images/artworks/AllKnowingNothing_79.jpeg", value: 2},
{name: "EnchantedMountains_89.jpeg", id: 101, filepath: "../static/images/artworks/EnchantedMountains_89.jpeg", value: 3},
{name: "TaintedVividness_99.jpeg", id: 102, filepath: "../static/images/artworks/TaintedVividness_99.jpeg", value: 4},
{name: "LosingTouch_79.jpeg", id: 103, filepath: "../static/images/artworks/LosingTouch_79.jpeg", value: 2},
{name: "ReflectingOrder_99.jpeg", id: 104, filepath: "../static/images/artworks/ReflectingOrder_99.jpeg", value: 4},
{name: "RollingShapes_89.jpeg", id: 105, filepath: "../static/images/artworks/RollingShapes_89.jpeg", value: 3},
{name: "SymmetricalAppearance_159.jpeg", id: 106, filepath: "../static/images/artworks/SymmetricalAppearance_159.jpeg", value: 10},
{name: "RestingLizard_69.jpeg", id: 107, filepath: "../static/images/artworks/RestingLizard_69.jpeg", value: 1},
{name: "MixedMinds_159.jpeg", id: 108, filepath: "../static/images/artworks/MixedMinds_159.jpeg", value: 10},
{name: "FlowerSyndrom_99.jpeg", id: 109, filepath: "../static/images/artworks/FlowerSyndrom_99.jpeg", value: 4},
{name: "ScribblesAndPassion_159.jpeg", id: 110, filepath: "../static/images/artworks/ScribblesAndPassion_159.jpeg", value: 10},
    ]


    let start = round * NUM_IMAGES;
    let end = start + NUM_IMAGES; 
    return all_arts.slice(start, end);
}