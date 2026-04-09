export const MainVideo = ({ scenes = [] }) => {
  return (
    <div>
      {scenes.map((scene, i) => (
        <div key={i}>{scene.text}</div>
      ))}
    </div>
  );
};