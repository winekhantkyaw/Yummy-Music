import { useState } from "react";

function AccountPanel({ supabase, user, profile, onSaveProfile, onClose }) {
  const [fullName, setFullName] = useState(profile?.name || user?.user_metadata?.full_name || "");
  const [avatar, setAvatar] = useState(profile?.avatar || "🎧");
  const [image, setImage] = useState(profile?.image || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const saveProfile = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await onSaveProfile({ name: fullName.trim(), avatar, image });
      setNotice("Profile updated.");
    } catch (updateError) {
      setError(updateError.message || "Could not update your profile.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) setError(signOutError.message);
      else onClose();
    } catch (signOutError) {
      setError(signOutError.message || "Could not sign out.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="account-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="account-panel" role="dialog" aria-modal="true" aria-labelledby="account-title">
        <button type="button" className="account-close" onClick={onClose} aria-label="Close account dialog">×</button>

        {(
          <>
            <span className="eyebrow">YOUR PROFILE</span>
            <div className="profile-heading">
              <div className="profile-preview">{image ? <img src={image} alt="Profile preview" /> : avatar}</div>
              <div><h2 id="account-title">Make it yours</h2><p className="account-description">Choose a photo or an icon for your Yummy profile.</p></div>
            </div>
            <form className="account-form" onSubmit={saveProfile}>
              <label>
                Display name
                <input value={fullName} onChange={(event) => setFullName(event.target.value)} required maxLength={60} placeholder="Your name" />
              </label>
              <div className="avatar-choice-label">Choose an icon</div>
              <div className="avatar-choices" role="group" aria-label="Choose a profile icon">
                {["🎧", "🎵", "🌙", "🌻", "🪩", "🐱", "✨", "💿"].map((icon) => (
                  <button key={icon} type="button" className={!image && avatar === icon ? "avatar-choice selected" : "avatar-choice"} onClick={() => { setAvatar(icon); setImage(""); }} aria-pressed={!image && avatar === icon}>{icon}</button>
                ))}
              </div>
              <label className="avatar-upload">
                Add a profile photo
                <input type="file" accept="image/*" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  if (file.size > 1024 * 1024) { setError("Choose an image smaller than 1 MB."); return; }
                  const reader = new FileReader();
                  reader.onload = () => { setImage(String(reader.result)); setError(""); };
                  reader.onerror = () => setError("Could not read that image. Try another file.");
                  reader.readAsDataURL(file);
                }} />
                <small>JPG, PNG, or GIF · up to 1 MB</small>
              </label>
              {user && <label>Email<input value={user.email || ""} readOnly /></label>}
              <button className="account-submit" type="submit" disabled={busy}>{busy ? "Saving…" : "Save profile"}</button>
            </form>
            {user && <button className="account-signout" type="button" onClick={signOut} disabled={busy}>Sign out</button>}
            {!user && <p className="account-message" role="status">Your profile is saved on this device.</p>}
          </>
        )}



        {error && <p className="account-message error" role="alert">{error}</p>}
        {notice && <p className="account-message" role="status">{notice}</p>}
      </section>
    </div>
  );
}

export default AccountPanel;
