import { useEffect, useState } from "react";
import { apiRequest } from "./lib/api";

export default function Dashboard({ user }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [groupName, setGroupName] = useState("");
  const [className, setClassName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const loadGroups = async () => {
    try {
      const data = await apiRequest("/groups");
      setGroups(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const createGroup = async () => {
    try {
      await apiRequest("/groups", {
        method: "POST",
        body: JSON.stringify({ name: groupName, className }),
      });

      setGroupName("");
      setClassName("");
      loadGroups();
    } catch (err) {
      alert(err.message);
    }
  };

  const joinGroup = async () => {
    try {
      await apiRequest("/groups/join", {
        method: "POST",
        body: JSON.stringify({ inviteCode }),
      });

      setInviteCode("");
      loadGroups();
    } catch (err) {
      alert(err.message);
    }
  };

  if (selectedGroup) {
    return (
      <GroupView
        groupId={selectedGroup}
        goBack={() => setSelectedGroup(null)}
      />
    );
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>

      <h2>Your Groups</h2>
      {groups.length === 0 && <p>No groups yet.</p>}
      {groups.map((g) => (
        <div key={g.id}>
          <button onClick={() => setSelectedGroup(g.id)}>
            {g.name}
          </button>
        </div>
      ))}

      <h2>Create Group</h2>
      <input
        placeholder="Group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <input
        placeholder="Class name"
        value={className}
        onChange={(e) => setClassName(e.target.value)}
      />
      <button onClick={createGroup}>Create</button>

      <h2>Join Group</h2>
      <input
        placeholder="Invite code"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
      />
      <button onClick={joinGroup}>Join</button>
    </div>
  );
}

function GroupView({ groupId, goBack }) {
  const [group, setGroup] = useState(null);

  useEffect(() => {
    const loadGroup = async () => {
      try {
        const data = await apiRequest(`/groups/${groupId}`);
        setGroup(data);
      } catch (err) {
        alert("Failed to load group");
      }
    };

    loadGroup();
  }, [groupId]);

  if (!group) return <div>Loading group...</div>;

  return (
    <div>
      <button onClick={goBack}>← Back</button>

      <h1>{group.name}</h1>
      <p>Class: {group.className}</p>
      <p>Invite Code: {group.inviteCode}</p>

      <h2>Members</h2>
      {group.members.map((m) => (
        <div key={m.user.id}>
          {m.user.name} ({m.user.email})
        </div>
      ))}
    </div>
  );
}
