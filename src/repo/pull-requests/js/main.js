if(address == "1RepoXU8bQE9m7ssNwL4nnxBnZVejHCc6") {
	location.href = "../../default/";
}

let currentPage = Number.isSafeInteger(+additional) ? +additional : 0;

function showFollowing(isFollowing) {
	document.getElementById("follow").innerHTML = isFollowing ? "Stop following" : "Follow issues and pull requests in newsfeed";
}

repo.addMerger()
	.then(() => {
		return repo.getContent();
	})
	.then(content => {
		if(!content.installed) {
			location.href = "../../install/?" + address;
		}

		showTitle(content.title);
		showHeader(1, content.git);
		showTabs(1);
		document.getElementById("new_pull_request").href = "new/?" + address;

		additional = +additional;
		return repo.getPullRequests(Number.isSafeInteger(additional) ? additional : 0);
	})
	.then(pullRequests => {
		pullRequests.pullRequests.forEach(pullRequest => {
			let tr = document.createElement("tr");
			tr.onclick = () => {
				location.href = "view/?" + address + "/" + pullRequest.id + "@" + pullRequest.json.replace("data/users/", "");
			};

			let title = document.createElement("td");
			title.textContent = pullRequest.title;
			tr.appendChild(title);

			let icon = document.createElement("div");
			icon.className = "pull-request-icon pull-request-status-" + (pullRequest.merged ? "merged" : "opened");
			title.insertBefore(icon, title.firstChild);

			let tags = document.createElement("div");
			tags.className = "tags";
			pullRequest.tags.forEach(tag => {
				let color = repo.tagToColor(tag);

				let node = document.createElement("div");
				node.className = "tag";
				node.textContent = tag;
				node.style.backgroundColor = color.background;
				node.style.color = color.foreground;
				tags.appendChild(node);
			});
			title.appendChild(tags);

			let info = document.createElement("td");
			info.textContent = "Opened on " + repo.translateDate(pullRequest.date_added) + " by " + pullRequest.cert_user_id;
			info.className = "pull-requests-right";
			tr.appendChild(info);

			document.getElementById("pull_requests").appendChild(tr);
		});

		if(currentPage > 0) {
			let button = document.getElementById("navigation_back");
			button.classList.remove("button-disabled");
			button.href = "?" + address + "/" + (currentPage - 1);
		}

		if(pullRequests.nextPage) {
			let button = document.getElementById("navigation_next");
			button.classList.remove("button-disabled");
			button.href = "?" + address + "/" + (currentPage + 1);
		}

		return repo.isFollowing();
	})
	.then(isFollowing => {
		let followButton = document.getElementById("follow");
		showFollowing(isFollowing);
		followButton.onclick = () => {
			if(isFollowing) {
				repo.unfollow()
					.then(() => {
						isFollowing = false;
						showFollowing(isFollowing);
					});
			} else {
				repo.follow()
					.then(() => {
						isFollowing = true;
						showFollowing(isFollowing);
					});
			}
		};
	});