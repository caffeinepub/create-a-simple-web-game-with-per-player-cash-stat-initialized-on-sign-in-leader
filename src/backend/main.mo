import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type PlayerID = Principal;
  type Cash = Nat;
  type Speed = Nat;

  let players = Map.empty<PlayerID, Cash>();
  let joinTimes = Map.empty<PlayerID, Time.Time>();
  let claimedReward = Map.empty<PlayerID, Bool>();
  let clickSpeeds = Map.empty<PlayerID, Speed>();
  let lastCoinPickup = Map.empty<PlayerID, Time.Time>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Player = {
    id : PlayerID;
    cash : Cash;
    joinedAt : Time.Time;
    hasClaimedReward : Bool;
    clickSpeed : Speed;
  };

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Constants
  let COIN_VALUE : Nat = 1;
  let MIN_COIN_PICKUP_INTERVAL : Time.Time = 100_000_000; // 0.1 seconds to prevent spam

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    checkUser(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    checkOwnerOrAdmin(caller, user);
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    checkUser(caller);
    userProfiles.add(caller, profile);
  };

  // Cash Management
  public shared ({ caller }) func initializeCash() : async () {
    checkUser(caller);
    if (players.containsKey(caller)) {
      Runtime.trap("Player already initialized.");
    };
    players.add(caller, 0);
    joinTimes.add(caller, Time.now());
    claimedReward.add(caller, false);
    clickSpeeds.add(caller, 1); // Initialize click speed to 1
    lastCoinPickup.add(caller, 0);
  };

  // Fixed amount coin pickup with rate limiting to prevent abuse
  public shared ({ caller }) func addCash() : async () {
    checkUser(caller);
    
    // Rate limiting check
    let lastPickup = switch (lastCoinPickup.get(caller)) {
      case (null) { 0 };
      case (?time) { time };
    };
    
    let now = Time.now();
    if (now - lastPickup < MIN_COIN_PICKUP_INTERVAL) {
      Runtime.trap("Coin pickup too fast. Please wait.");
    };
    
    let currentCash = switch (players.get(caller)) {
      case (null) { Runtime.trap("Player not initialized. Use initializeCash() first.") };
      case (?cash) { cash + COIN_VALUE };
    };
    players.add(caller, currentCash);
    lastCoinPickup.add(caller, now);
  };

  // Admin-only function to award custom cash amounts
  public shared ({ caller }) func adminAddCash(player : Principal, amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    
    let currentCash = switch (players.get(player)) {
      case (null) { amount };
      case (?cash) { cash + amount };
    };
    players.add(player, currentCash);
  };

  public shared ({ caller }) func claimStarterReward() : async () {
    checkUser(caller);
    let joinedAt = switch (joinTimes.get(caller)) {
      case (null) { Runtime.trap("Player not initialized. Use initializeCash() first.") };
      case (?joinedAt) { joinedAt };
    };

    switch (claimedReward.get(caller)) {
      case (?true) { Runtime.trap("Starter reward already claimed.") };
      case (_) {
        if (Time.now() - joinedAt < 5_000_000_000) {
          Runtime.trap("Reward claim attempt: Must wait at least 5 seconds after initialization.");
        };
      };
    };

    let currentCash = switch (players.get(caller)) {
      case (null) { Runtime.trap("Player not found") };
      case (?cash) { cash + 100 };
    };
    players.add(caller, currentCash);
    claimedReward.add(caller, true);
  };

  public query ({ caller }) func getCash() : async Cash {
    checkUser(caller);
    switch (players.get(caller)) {
      case (null) { Runtime.trap("Player not initialized. Use initializeCash() first.") };
      case (?cash) { cash };
    };
  };

  // Speed Upgrade
  public shared ({ caller }) func upgradeSpeed() : async () {
    checkUser(caller);
    let currentCash = switch (players.get(caller)) {
      case (null) { Runtime.trap("Player not found. Use initializeCash() first.") };
      case (?cash) { cash };
    };

    if (currentCash < 10) {
      Runtime.trap("Not enough cash to upgrade speed. Need 10 cash.");
    };

    let currentSpeed = switch (clickSpeeds.get(caller)) {
      case (null) { 1 }; // Default speed is 1 if not set
      case (?speed) { speed };
    };

    players.add(caller, currentCash - 10 : Nat);
    clickSpeeds.add(caller, currentSpeed + 1 : Nat);
  };

  // Player Status
  public query ({ caller }) func getPlayerStatus() : async Player {
    checkUser(caller);
    let (cash, joinedAt, hasClaimedReward, clickSpeed) = switch (
      (
        players.get(caller),
        joinTimes.get(caller),
        claimedReward.get(caller),
        clickSpeeds.get(caller),
      )
    ) {
      case (null, _, _, _) {
        Runtime.trap("Player not initialized. Use initializeCash() first.");
      };
      case (_, null, _, _) {
        Runtime.trap("Error: Missing join time. Initialization required.");
      };
      case (_, _, null, _) {
        Runtime.trap("Error: Missing claimed reward status. Initialization required.");
      };
      case (?cash, ?joinedAt, ?hasClaimedReward, ?clickSpeed) {
        (cash, joinedAt, hasClaimedReward, clickSpeed);
      };
      case (?cash, ?joinedAt, ?hasClaimedReward, null) {
        (cash, joinedAt, hasClaimedReward, 1); // Default speed if not set
      };
    };

    {
      id = caller;
      cash;
      joinedAt;
      hasClaimedReward;
      clickSpeed;
    };
  };

  // New Cash Leaderboard Functionality
  public type LeaderboardEntry = {
    player : Principal;
    cash : Nat;
  };

  // Returns the top N players with their cash values, sorted by cash descending.
  public query ({ caller }) func getCashLeaderboard(limit : Nat) : async [LeaderboardEntry] {
    checkUser(caller);
    let entries = players.toArray().map(
      func((player, cash)) {
        { player; cash };
      }
    );

    let sortedEntries = entries.sort(
      func(a, b) {
        Nat.compare(b.cash, a.cash);
      }
    );

    let actualLimit = if (limit > sortedEntries.size()) { sortedEntries.size() } else {
      limit;
    };
    sortedEntries.sliceToArray(0, actualLimit);
  };

  // Admin-only function to ensure the admin is always cash leader
  public shared ({ caller }) func enforceAdminCashLeadership(admin : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let adminCash = switch (players.get(admin)) {
      case (null) { 0 };
      case (?cash) { cash };
    };

    for ((player, cash) in players.entries()) {
      if (player != admin and cash >= adminCash) {
        players.add(player, adminCash - 1 : Nat);
      };
    };
  };

  // Authorization Helper Functions
  func checkUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access this resource");
    };
  };

  func checkOwnerOrAdmin(caller : Principal, resourceOwner : Principal) {
    if (caller != resourceOwner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only access your own resource");
    };
  };
};
