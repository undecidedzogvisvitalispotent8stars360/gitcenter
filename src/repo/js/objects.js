function showObjects(context, cssContext, objects) {
	objects.objects.forEach(object => {
		let status = {
			issue: (object.open ? (object.reopened ? "reopened" : "open") : "closed"),
			pull_request: object.merged ? "merged" : "opened"
		}[context];

		let tr = document.createElement("tr");
		tr.onclick = () => {
			location.href = "view/?" + address + "/" + object.id + "@" + object.json.replace("data/users/", "");
		};

		let content = document.createElement("td");

		let icon = document.createElement("div");
		icon.className = cssContext + "-icon " + cssContext + "-status-" + status;
		content.appendChild(icon);

		let title = document.createElement("div");
		title.className = cssContext + "-title";
		title.textContent = object.title;
		content.appendChild(title);

		let tags = document.createElement("div");
		tags.className = "tags";
		object.tags.forEach(tag => {
			let color = repo.tagToColor(tag);

			let node = document.createElement("div");
			node.className = "tag";
			node.textContent = tag;
			node.style.backgroundColor = color.background;
			node.style.color = color.foreground;
			tags.appendChild(node);
		});
		content.appendChild(tags);

		let info = document.createElement("div");
		info.textContent = "#" + object.id + "@" + object.json.replace("data/users/", "") + " opened " + repo.translateDate(object.date_added) + " by " + object.cert_user_id;
		info.className = cssContext + "s-bottom";
		content.appendChild(info);

		tr.appendChild(content);
		document.getElementById(context + "s").appendChild(tr);
	});
}