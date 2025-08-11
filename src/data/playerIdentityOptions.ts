// Player Identity options - single source of truth
// Using HSL-themed UI components elsewhere, only data here

export type MainRole = "Goalkeeper" | "Defender" | "Midfielder" | "Attacker";

export type RoleTypeOption = {
  value: string;
  label: string;
  subtitle: string;
};

export const MAIN_ROLES: { value: MainRole; label: string }[] = [
  { value: "Goalkeeper", label: "Goalkeeper 🧤" },
  { value: "Defender", label: "Defender 🛡" },
  { value: "Midfielder", label: "Midfielder 🎯" },
  { value: "Attacker", label: "Attacker ⚡" },
];

export const ROLE_TYPES: Record<MainRole, RoleTypeOption[]> = {
  Goalkeeper: [
    { value: "gk_shot_stopper", label: "Shot Stopper (Alisson)", subtitle: "Brave in 1v1s, big saves" },
    { value: "gk_sweeper", label: "Sweeper Keeper (Ederson)", subtitle: "Good on the ball, starts attacks" },
    { value: "gk_commanding_box", label: "Commanding Box (Neuer)", subtitle: "Wins high balls, talks all game" },
    { value: "gk_distributor", label: "Distributor (Ter Stegen)", subtitle: "Accurate long/short distribution" },
  ],
  Defender: [
    { value: "df_tackling_machine", label: "Tackling Machine (Varane)", subtitle: "Stops attacks with timing & strength" },
    { value: "df_build_up_boss", label: "Build-Up Boss (John Stones)", subtitle: "Calm on ball, breaks lines" },
    { value: "df_fast_agile", label: "Fast & Agile (Kyle Walker)", subtitle: "Wins races, great recovery" },
    { value: "df_physical_leader", label: "Physical Leader (Van Dijk)", subtitle: "Aerials, organisation, presence" },
  ],
  Midfielder: [
    { value: "mf_box_to_box", label: "Box-to-Box Engine (Bellingham)", subtitle: "Covers ground, drives forward" },
    { value: "mf_creator", label: "Creator (De Bruyne)", subtitle: "Killer passes, chance creator" },
    { value: "mf_dribbler_breaker", label: "Dribbler & Breaker (Bernardo Silva)", subtitle: "Beats players, opens space" },
    { value: "mf_shield", label: "Shield (Casemiro)", subtitle: "Protects defence, wins duels" },
  ],
  Attacker: [
    { value: "at_finisher", label: "Finisher (Haaland)", subtitle: "Right place, right time, goals" },
    { value: "at_dribbler", label: "Dribbler (Vinícius Jr)", subtitle: "1v1 threat, creates danger" },
    { value: "at_speed_threat", label: "Speed Threat (Mbappé)", subtitle: "Runs in behind, stretches lines" },
    { value: "at_target_player", label: "Target Player (Giroud)", subtitle: "Hold-up, link play, aerials" },
  ],
};

export const STRENGTHS_BY_ROLE_TYPE: Record<string, string[]> = {
  gk_shot_stopper: ["1v1 bravery","Reflex saves","Positioning","Handling","Set–see–save"],
  gk_sweeper: ["Starting positions","Reading through balls","First touch","Short passing","Composure"],
  gk_commanding_box: ["High balls","Claiming crosses","Communication","Aerial timing","Starting shape"],
  gk_distributor: ["Side-volley kick","Throwing accuracy","Switches","Build-up passing","Decision speed"],

  df_tackling_machine: ["Timing in tackle","Body contact","Blocking shots","1v1 duels","Front-foot defending"],
  df_build_up_boss: ["Breaking lines","First touch","Composed under press","Angle creation","Switch of play"],
  df_fast_agile: ["Recovery runs","Turning speed","Covering space","Anticipation","Shoulder checks"],
  df_physical_leader: ["Aerial duels","Box defending","Positioning","Command voice","Protecting the area"],

  mf_box_to_box: ["Work rate","Winning second balls","Third-man runs","Ball carry","Pressing triggers"],
  mf_creator: ["Vision","Through balls","Final pass","Set-pieces","Half-turn receiving"],
  mf_dribbler_breaker: ["Tight-space dribble","Change of direction","Shielding","Carry past line","Quick 1-2s"],
  mf_shield: ["Interceptions","Screening lanes","Open body shape","Simple tempo pass","Tackle timing"],

  at_finisher: ["First-time finishing","Runs across CB","Box movement","Shot volume","First touch to shoot"],
  at_dribbler: ["1v1 take-ons","Explosive first step","Feints","Cut inside & shoot","Draw fouls"],
  at_speed_threat: ["Run in behind","Timing runs","Hold the line","Breakaway finishing","Weak-side run"],
  at_target_player: ["Hold-up play","Lay-offs","Aerial presence","Near-post runs","Protect the ball"],
};

export const HELPS_TEAM_OPTIONS: string[] = [
  "Create chances","Score goals","Stop attacks","Protect the goal","Keep the ball moving","Win the ball back",
];

export const MOTTO_SUGGESTIONS: string[] = [
  "Confidence is built. I build it every day.",
  "No hiding. I want the ball.",
  "Earn it with actions.",
  "Calm mind. Full speed.",
  "Next play. Best play.",
];
