// Player Identity options - single source of truth
// Using HSL-themed UI components elsewhere, only data here


export type MainRole = "Goalkeeper" | "Defender" | "Midfielder" | "Attacker";

export type RoleTypeOption = {
  value: string;
  label: string;
  subtitle: string;
  image?: string;
};

export const MAIN_ROLES: { value: MainRole; label: string }[] = [
  { value: "Goalkeeper", label: "Goalkeeper 🧤" },
  { value: "Defender", label: "Defender 🛡" },
  { value: "Midfielder", label: "Midfielder 🎯" },
  { value: "Attacker", label: "Attacker ⚡" },
];

export const ROLE_TYPES: Record<MainRole, RoleTypeOption[]> = {
  Goalkeeper: [
    { value: "gk_shot_stopper", label: "Shot Stopper (Alisson)", subtitle: "Brave in 1v1s, big saves", image: "/lovable-uploads/c5dfaa48-6f6c-475f-b9f2-50295eb558f6.png" },
    { value: "gk_sweeper", label: "Sweeper (Neuer)", subtitle: "Starts attacks, reads through balls, great with feet", image: "/lovable-uploads/309c4943-05f4-4973-b501-bd34bf0369f7.png" },
    { value: "gk_commanding_box", label: "Commanding Box (Buffon)", subtitle: "Wins high balls, commands defence", image: "/lovable-uploads/f245edc5-0d9f-4f66-8385-7a1e6c6958c3.png" },
    { value: "gk_distributor", label: "Distributor (Ederson)", subtitle: "Passes with precision, builds play from the back", image: "/lovable-uploads/ffbe4239-9cb2-4a0b-81f9-05ae3791e324.png" },
  ],
  Defender: [
    { value: "df_tackling_machine", label: "Tackling Machine (Varane)", subtitle: "Stops attacks with timing & strength", image: "/lovable-uploads/2eb275c8-9c4f-4ec4-ad44-6c187a6574f9.png" },
    { value: "df_build_up_boss", label: "Build-Up Boss (John Stones)", subtitle: "Calm on ball, breaks lines", image: "/lovable-uploads/9465dcb3-1c9c-437f-8a97-70bdb98138e6.png" },
    { value: "df_fast_agile", label: "Fast & Agile (Kyle Walker)", subtitle: "Wins races, great recovery", image: "/lovable-uploads/b371b255-65d7-4611-8622-775b0ca71ab5.png" },
    { value: "df_physical_leader", label: "Physical Leader (Van Dijk)", subtitle: "Aerials, organisation, presence", image: "/lovable-uploads/dd663178-7932-4ce1-9096-fca86e6894b0.png" },
  ],
  Midfielder: [
    { value: "mf_box_to_box", label: "Box-to-Box Engine (Bellingham)", subtitle: "Covers ground, drives forward", image: "/lovable-uploads/dc72311d-a6de-43f7-b716-22bc288788b8.png" },
    { value: "mf_creator", label: "Creator (De Bruyne)", subtitle: "Killer passes, chance creator", image: "/lovable-uploads/6f3ac988-6452-4f6a-ac0c-94f8f78c09bf.png" },
    { value: "mf_dribbler_breaker", label: "Dribbler & Breaker (Bernardo Silva)", subtitle: "Beats players, opens space", image: "/lovable-uploads/64f3753d-631d-4333-a306-8aa2d85ae9ad.png" },
    { value: "mf_controller", label: "Controller (Vitinha)", subtitle: "Controls tempo, builds play & connects", image: "/lovable-uploads/82224132-e6fb-4ece-bb8a-6a03de6cef1b.png" },
    { value: "mf_shield", label: "Shield (Casemiro)", subtitle: "Protects defence, wins duels", image: "/lovable-uploads/c2cc2cc7-b3de-405b-bc10-ffbf38708bd2.png" },
  ],
  Attacker: [
    { value: "at_finisher", label: "Finisher (Haaland)", subtitle: "Right place, right time, goals", image: "/lovable-uploads/845ad646-7818-420c-aefa-563600f71220.png" },
    { value: "at_dribbler", label: "Dribbler (Vinícius Jr)", subtitle: "1v1 threat, creates danger", image: "/lovable-uploads/4935997c-170d-48a8-befa-fc5466bcbd4e.png" },
    { value: "at_speed_threat", label: "Speed Threat (Mbappé)", subtitle: "Runs in behind, stretches lines", image: "/lovable-uploads/947c11af-3137-4525-ac6e-785a66ec0a0c.png" },
    { value: "at_target_player", label: "Target Player (Harry Kane)", subtitle: "Hold-up, link play, aerials", image: "/lovable-uploads/3156cd9c-8977-4b2b-a8e8-237aad7c1127.png" },
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
  mf_controller: ["Tempo control","Progressive passing","Receives under pressure","Switch of play","Dictates rhythm"],
  mf_shield: ["Interceptions","Screening lanes","Open body shape","Simple tempo pass","Tackle timing"],

  at_finisher: ["First-time finishing","Runs across CB","Box movement","Shot volume","First touch to shoot"],
  at_dribbler: ["1v1 take-ons","Explosive first step","Feints","Cut inside & shoot","Draw fouls"],
  at_speed_threat: ["Run in behind","Timing runs","Hold the line","Breakaway finishing","Weak-side run"],
  at_target_player: ["Hold-up play","Lay-offs","Aerial presence","Near-post runs","Protect the ball"],
};

export const UNIVERSAL_STRENGTHS_OUTFIELD: string[] = [
  "First touch","Technical ability","Physicality","One-touch passes","Connecting with others","Beating players 1v1","Driving with the ball","Ball control","Tight-space dribbling","Scanning","Heads up","I am faster than most","I am good at changing speed & direction","Breaking lines with passes",
];

export const GOALKEEPER_STRENGTHS: string[] = [
  "1v1 bravery","Reflex saves","Positioning","Handling","Communication","Starting positions","Distribution accuracy (short/long)","Decision speed under pressure",
];

export const HELPS_TEAM_GK: string[] = [
  "Stop shots",
  "Command the defence",
  "Distribute to start attacks",
  "Organise from the back",
  "Claim crosses and high balls",
  "Leadership",
];

export const HELPS_TEAM_OUTFIELD: string[] = [
  "Create chances","Score goals","Stop attacks","Keep the ball moving","Win the ball back","Drive the team forward","Control the game","Support teammates","Leadership",
];

export const MOTTO_SUGGESTIONS: string[] = [
  "Confidence is built. I build it every day.",
  "No hiding. I want the ball.",
  "Earn it with actions.",
  "Calm mind. Full speed.",
  "Next play. Best play.",
];
