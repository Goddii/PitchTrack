import silhouette from "../assets/player-silhouette.webp"

/**
 * Stand-in portrait for a player with no photo. The source is a dark back-lit photo on a black
 * background, so it is blended onto the surface behind it (see .silhouette-img) instead of
 * showing a black box.
 */
export default function SilhouettePlaceholder({ className = "" }) {
    return (
        <img
            src={silhouette}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={`silhouette-img select-none ${className}`}
        />
    )
}
