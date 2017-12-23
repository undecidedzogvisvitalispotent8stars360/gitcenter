zeroFrame = new ZeroFrame();
zeroPage = new ZeroPage(zeroFrame);
zeroDB = new ZeroDB(zeroPage);

function escapeString(str) {
	return "\"" + (
		str
			.replace(/\//g, "//")
			.replace(/"/g, "\"")
	) + "\"";
}
function updateIndex(search) {
	let link = {
		stop: false
	};

	let required = [];
	let maybe = [];
	let state = "";
	let sort = "stars";
	search.split(/\s+/)
		.filter(word => word.length)
		.forEach(word => {
			word = word
				.replace(/\*/g, "%")
				.replace(/\?/g, "_");

			if(word.indexOf("sort:") > -1) {
				sort = word.substr(5);
			} else if(word[0] == "+" && word.length > 1) {
				required.push("\
					repo_index.description LIKE " + escapeString("%" + word.substr(1) + "%") + "\
					OR\
					repo_index.title LIKE " + escapeString("%" + word.substr(1) + "%") + "\
				");
			} else {
				maybe.push("\
					repo_index.description LIKE " + escapeString("%" + word + "%") + "\
					OR\
					repo_index.title LIKE " + escapeString("%" + word + "%") + "\
				");
			}
		});

	if(sort == "stars") {
		sort = "stars";
	} else if(sort == "date") {
		sort = "date_added";
	} else {
		sort = "stars";
	}

	link.promise = zeroDB.query("\
		SELECT repo_index.*, json.cert_user_id, COUNT(repo_stars.address) AS stars\
		FROM repo_index, json\
		LEFT JOIN repo_stars ON repo_stars.address = repo_index.address\
		\
		WHERE repo_index.json_id = json.json_id AND (" +
			(required.length ? "(" + required.join(") AND (") + ")" : "1 = 1") + "\
			AND " +
			(maybe.length ? "(" + maybe.join(") OR (") + ")" : "1 = 1") + "\
		)\
		GROUP BY repo_index.address\
		ORDER BY " + sort + " DESC\
	")
		.then(index => {
			if(link.stop) {
				return;
			}

			document.getElementById("repos").innerHTML = "";

			index.forEach(repo => {
				let node = document.createElement("a");
				node.className = "repo";
				node.href = "/" + repo.address;

				let stars = document.createElement("div");
				stars.className = "repo-stars";
				stars.textContent = repo.stars;
				node.appendChild(stars);

				let title = document.createElement("div");
				title.className = "repo-title";
				title.textContent = repo.title;
				node.appendChild(title);

				let address = document.createElement("div");
				address.className = "repo-address";
				address.textContent = repo.description;
				address.appendChild(document.createElement("br"));
				address.appendChild(document.createTextNode(repo.address));
				node.appendChild(address);

				document.getElementById("repos").appendChild(node);
			});
		});

	return link;
}

let search = decodeURIComponent((location.search.match(/[?&]q=(.+?)(&|$)/) || ["", ""])[1]);
document.getElementById("search").value = search;
let link = updateIndex(search);
link.promise.then(() => {
	document.getElementById("search").oninput = () => {
		link.stop = true;
		link = updateIndex(document.getElementById("search").value);

		zeroPage.cmd("wrapperReplaceState", [null, "Search - Git Center", "?q=" + document.getElementById("search").value]);
	};
});

window.addEventListener("load", () => {
	setTitle("Repository Index");
});